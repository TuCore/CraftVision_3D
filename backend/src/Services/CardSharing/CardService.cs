using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.CardSharing;

public sealed record OwnerCard(Guid Id, int Revision, JsonElement Draft, DateTime UpdatedAt, DateTime? PublishedAt, string? SharePath);
public sealed class CardService(CardDatabase db, CardValidator validator)
{
    public static OwnerCard View(StoredCard card) => new(card.Id, card.Revision, JsonSerializer.Deserialize<JsonElement>(card.DraftJson), card.UpdatedAt, card.PublishedAt, card.ShareToken is null ? null : $"/love-gift/s/{card.ShareToken}");
    public async Task<OwnerCard[]> List(Guid owner, CancellationToken ct) => (await db.Cards.AsNoTracking().Where(c => c.OwnerId == owner).OrderByDescending(c => c.UpdatedAt).Take(100).ToArrayAsync(ct)).Select(View).ToArray();
    public async Task<StoredCard> Find(Guid owner, Guid id, CancellationToken ct) => await db.Cards.SingleOrDefaultAsync(c => c.Id == id && c.OwnerId == owner, ct) ?? throw new CardError(404, "Không tìm thấy thiệp.");
    private async Task<Dictionary<Guid, string>> Validate(Guid owner, JsonElement draft, CancellationToken ct)
    {
        var refs = validator.Validate(draft);
        var ids = refs.Keys.ToArray();
        var assets = await db.Assets.Where(a => a.OwnerId == owner && ids.Contains(a.Id)).ToListAsync(ct);
        if (assets.Count != refs.Count || assets.Any(a => !a.ContentType.StartsWith(refs[a.Id] + "/", StringComparison.Ordinal))) throw new CardError(400, "Ảnh hoặc nhạc không thuộc tài khoản này.");
        return refs;
    }
    public async Task<OwnerCard> Create(Guid owner, JsonElement draft, CancellationToken ct)
    {
        await Validate(owner, draft, ct);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Serialize quota checks for this owner across concurrent requests.
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({owner.ToString()}, 0))", ct);
        if (await db.Cards.CountAsync(c => c.OwnerId == owner, ct) >= 100) throw new CardError(422, "Mỗi tài khoản lưu tối đa 100 thiệp.");
        var card = new StoredCard { OwnerId = owner, DraftJson = draft.GetRawText() };
        db.Cards.Add(card); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return View(card);
    }
    public async Task<OwnerCard> Update(Guid owner, Guid id, int revision, JsonElement draft, CancellationToken ct)
    {
        var card = await Find(owner, id, ct); Check(card, revision);
        await Validate(owner, draft, ct);
        if (JsonSerializer.Deserialize<JsonElement>(card.DraftJson).GetProperty("template").GetString() != draft.GetProperty("template").GetString()) throw new CardError(400, "Không thể đổi mẫu của thiệp đã lưu.");
        card.DraftJson = draft.GetRawText(); await Save(card, ct); return View(card);
    }
    public async Task<OwnerCard> Publish(Guid owner, Guid id, int revision, bool revoke, CancellationToken ct)
    {
        var card = await Find(owner, id, ct); Check(card, revision);
        var refs = revoke ? [] : await Validate(owner, JsonSerializer.Deserialize<JsonElement>(card.DraftJson), ct);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Update the concurrency token before replacing the published media references.
        card.PublishedJson = revoke ? null : card.DraftJson;
        card.ShareToken = revoke ? null : card.ShareToken ?? Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        card.PublishedAt = revoke ? null : DateTime.UtcNow;
        await Save(card, ct);
        await db.PublishedAssets.Where(a => a.CardId == id).ExecuteDeleteAsync(ct);
        foreach (var asset in refs.Keys) db.PublishedAssets.Add(new PublishedAsset { CardId = id, AssetId = asset });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return View(card);
    }
    public async Task<JsonElement> Public(string token, CancellationToken ct)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(token, "^[A-Za-z0-9_-]{43}$")) throw new CardError(404, "Link không tồn tại hoặc đã được thu hồi.");
        var json = await db.Cards.AsNoTracking().Where(c => c.ShareToken == token).Select(c => c.PublishedJson).SingleOrDefaultAsync(ct);
        return json is null ? throw new CardError(404, "Link không tồn tại hoặc đã được thu hồi.") : JsonSerializer.Deserialize<JsonElement>(json);
    }
    private static void Check(StoredCard card, int revision) { if (card.Revision != revision) throw new CardError(409, "Thiệp đã được sửa ở nơi khác. Mở lại bản trên server trước khi tiếp tục."); }
    private async Task Save(StoredCard card, CancellationToken ct)
    {
        card.Revision++; card.UpdatedAt = DateTime.UtcNow;
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new CardError(409, "Thiệp đã được sửa ở nơi khác. Hãy mở lại bản trên server."); }
    }
}
