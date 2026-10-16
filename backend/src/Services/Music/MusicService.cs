using Microsoft.EntityFrameworkCore;

namespace CraftVision.Music;

public sealed class MusicError(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed record TrackInput(string Title, string? AudioUrl, bool IsEnabled, int SortOrder, int Revision,
    byte[]? File = null);
public sealed record TrackView(Guid Id, string Title, string AudioUrl, string? SourceUrl,
    bool IsEnabled, int SortOrder, int Revision);

public static class MusicValidation
{
    public const int MaxBytes = 15 * 1024 * 1024;

    public static void Validate(TrackInput input, bool creating)
    {
        if (string.IsNullOrWhiteSpace(input.Title) || input.Title.Trim().Length > 120)
            throw new MusicError(400, "Tên bài nhạc phải có từ 1 đến 120 ký tự.");
        if (input.SortOrder is < 0 or > 10000)
            throw new MusicError(400, "Thứ tự phát phải từ 0 đến 10000.");
        if (!creating && input.Revision < 1)
            throw new MusicError(400, "Thiếu phiên bản bài nhạc. Vui lòng tải lại danh sách.");
        var hasUrl = !string.IsNullOrWhiteSpace(input.AudioUrl);
        if (hasUrl && input.File is not null)
            throw new MusicError(400, "Chỉ chọn một nguồn: tệp nhạc hoặc đường dẫn audio.");
        if (creating && !hasUrl && input.File is null)
            throw new MusicError(400, "Vui lòng chọn tệp nhạc hoặc nhập đường dẫn audio.");
        if (hasUrl && (input.AudioUrl!.Length > 2048 ||
            !Uri.TryCreate(input.AudioUrl.Trim(), UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps || uri.UserInfo.Length > 0 || uri.IsLoopback))
            throw new MusicError(400, "Đường dẫn nhạc phải là URL HTTPS công khai, không chứa thông tin đăng nhập.");
        if (input.File is not null) ContentType(input.File);
    }

    public static string ContentType(byte[] bytes)
    {
        if (bytes.Length > MaxBytes) throw new MusicError(413, "Tệp nhạc tối đa 15 MB.");
        var data = bytes.AsSpan();
        if (data.Length >= 12 && data[..4].SequenceEqual("RIFF"u8) && data.Slice(8, 4).SequenceEqual("WAVE"u8))
            return "audio/wav";
        if (data.Length >= 4 && data[..4].SequenceEqual("OggS"u8)) return "audio/ogg";
        if (data.Length >= 3 && data[..3].SequenceEqual("ID3"u8)) return "audio/mpeg";
        if (data.Length >= 4 && data[0] == 0xff && (data[1] & 0xe0) == 0xe0 &&
            (data[1] & 0x18) != 0x08 && (data[1] & 0x06) != 0 &&
            (data[2] & 0xf0) is not 0 and not 0xf0 && (data[2] & 0x0c) != 0x0c)
            return "audio/mpeg";
        throw new MusicError(400, "Tệp không hợp lệ. Hỗ trợ MP3, WAV hoặc OGG.");
    }
}

public sealed class MusicService(MusicDatabase database)
{
    private static TrackView View(MusicTrack track) => new(track.Id, track.Title,
        track.SourceUrl ?? $"/api/music/tracks/{track.Id}/audio?v={track.MediaVersion}",
        track.SourceUrl, track.IsEnabled, track.SortOrder, track.Revision);

    public async Task<TrackView[]> List(bool admin, CancellationToken ct)
    {
        // Never load audio blobs when listing a playlist.
        var tracks = await database.Tracks.AsNoTracking().Where(t => admin || t.IsEnabled)
            .OrderBy(t => t.SortOrder).ThenBy(t => t.Id)
            .Select(t => new MusicTrack { Id = t.Id, Title = t.Title, SourceUrl = t.SourceUrl,
                IsEnabled = t.IsEnabled, SortOrder = t.SortOrder, Revision = t.Revision, MediaVersion = t.MediaVersion })
            .ToArrayAsync(ct);
        return tracks.Select(View).ToArray();
    }

    public async Task<TrackView> Save(Guid? id, TrackInput input, CancellationToken ct)
    {
        MusicValidation.Validate(input, id is null);
        var track = id is null ? new MusicTrack() : await Find(id.Value, ct);
        if (id is not null && track.Revision != input.Revision) throw Conflict();
        track.Title = input.Title.Trim();
        track.IsEnabled = input.IsEnabled;
        track.SortOrder = input.SortOrder;
        if (input.File is not null)
        {
            track.AudioData = input.File;
            track.ContentType = MusicValidation.ContentType(input.File);
            track.SourceUrl = null;
            track.MediaVersion++;
        }
        else if (!string.IsNullOrWhiteSpace(input.AudioUrl) && track.SourceUrl != input.AudioUrl.Trim())
        {
            track.SourceUrl = input.AudioUrl.Trim();
            track.AudioData = null;
            track.ContentType = null;
            track.MediaVersion++;
        }
        if (id is null) database.Tracks.Add(track);
        else track.Revision++;
        await Commit(ct);
        return View(track);
    }

    public async Task Delete(Guid id, int revision, CancellationToken ct)
    {
        var track = await Find(id, ct);
        if (track.Revision != revision) throw Conflict();
        database.Tracks.Remove(track);
        await Commit(ct);
    }

    public async Task<(byte[] Bytes, string ContentType)> Audio(Guid id, bool admin, CancellationToken ct)
    {
        var track = await database.Tracks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id && (admin || t.IsEnabled), ct);
        if (track?.AudioData is null || track.ContentType is null) throw new MusicError(404, "Không tìm thấy bài nhạc.");
        return (track.AudioData, track.ContentType);
    }

    private async Task<MusicTrack> Find(Guid id, CancellationToken ct) =>
        await database.Tracks.FindAsync([id], ct) ?? throw new MusicError(404, "Không tìm thấy bài nhạc.");

    private static MusicError Conflict() => new(409, "Bài nhạc đã được thay đổi. Vui lòng tải lại danh sách trước khi sửa hoặc xóa.");

    private async Task Commit(CancellationToken ct)
    {
        try { await database.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw Conflict(); }
    }
}
