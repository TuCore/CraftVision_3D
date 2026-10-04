using System.Security.Cryptography;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CraftVision.CardSharing;

public sealed class CardMedia(CardDatabase db, IConfiguration configuration)
{
    public const int MaxBytes = 8 * 1024 * 1024;
    public static string Detect(byte[] bytes)
    {
        var b = bytes.AsSpan();
        if (b.Length < 12) throw new CardError(400, "Tệp media không hợp lệ.");
        if (b[0] == 0xff && b[1] == 0xd8 && b[2] == 0xff) return "image/jpeg";
        if (b[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        if (b[..4].SequenceEqual("RIFF"u8) && b.Slice(8, 4).SequenceEqual("WEBP"u8)) return "image/webp";
        if (b[..4].SequenceEqual("RIFF"u8) && b.Slice(8, 4).SequenceEqual("WAVE"u8)) return "audio/wav";
        if (b[..4].SequenceEqual("OggS"u8)) return "audio/ogg";
        if (b[..3].SequenceEqual("ID3"u8) || (b[0] == 0xff && (b[1] & 0xe0) == 0xe0)) return "audio/mpeg";
        throw new CardError(400, "Chỉ hỗ trợ JPEG, PNG, WebP, MP3, WAV và OGG.");
    }
    public async Task<StoredAsset> Upload(Guid owner, byte[] bytes, CancellationToken ct)
    {
        if (bytes.Length > MaxBytes) throw new CardError(413, "Tệp tối đa 8 MB.");
        var contentType = Detect(bytes);
        var hash = Convert.ToHexString(SHA256.HashData(bytes));
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({owner.ToString()}, 0))", ct);
        var existing = await db.Assets.SingleOrDefaultAsync(a => a.OwnerId == owner && a.Hash == hash, ct);
        if (existing is not null) return existing;
        var used = await db.Assets.Where(a => a.OwnerId == owner).SumAsync(a => (long?)a.Length, ct) ?? 0;
        if (used + bytes.Length > 256L * 1024 * 1024) throw new CardError(422, "Đã đạt giới hạn 256 MB media cho tài khoản.");
        string Setting(string key) => configuration[$"CloudinarySettings:{key}"] ?? "";
        if (new[] { "CloudName", "ApiKey", "ApiSecret" }.Any(k => string.IsNullOrWhiteSpace(Setting(k)))) throw new CardError(503, "Máy chủ chưa cấu hình kho ảnh và nhạc.");
        var cloud = new Cloudinary(new Account(Setting("CloudName"), Setting("ApiKey"), Setting("ApiSecret")));
        using var stream = new MemoryStream(bytes);
        var folder = (Setting("UploadFolder") is { Length: > 0 } configured ? configured : "craftvision/uploads") + "/cards";
        // A deterministic private asset identifier makes retries idempotent after DB failures.
        var publicId = $"{owner:N}/{hash.ToLowerInvariant()}";
        UploadResult result = contentType.StartsWith("image/", StringComparison.Ordinal)
            ? await cloud.UploadAsync(new ImageUploadParams { File = new FileDescription("card", stream), Folder = folder, PublicId = publicId, Type = "authenticated", Overwrite = false }, ct)
            : await cloud.UploadAsync(new VideoUploadParams { File = new FileDescription("card", stream), Folder = folder, PublicId = publicId, Type = "authenticated", Overwrite = false }, ct);
        if (result.Error is not null || result.SecureUrl is null) throw new CardError(502, "Không thể lưu media. Vui lòng thử lại.");
        // Signed authenticated delivery is kept exclusively on the server, never in draft JSON.
        var resource = contentType.StartsWith("image/", StringComparison.Ordinal) ? "image" : "video";
        var signedUrl = cloud.Api.UrlImgUp.Secure(true).ResourceType(resource).Action("authenticated").Signed(true).Version(result.Version).BuildUrl($"{result.PublicId}.{result.Format}");
        var asset = new StoredAsset { OwnerId = owner, StorageUrl = signedUrl, ContentType = contentType, Length = bytes.Length, Hash = hash };
        db.Assets.Add(asset); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return asset;
    }
    public async Task<StoredAsset> Get(Guid id, Guid? owner, CancellationToken ct)
    {
        var asset = await db.Assets.AsNoTracking().SingleOrDefaultAsync(a => a.Id == id, ct);
        if (asset is null || (asset.OwnerId != owner && !await db.PublishedAssets.AnyAsync(p => p.AssetId == id, ct))) throw new CardError(404, "Không tìm thấy media.");
        return asset;
    }
}
