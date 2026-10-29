using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.CardSharing;

public sealed class CardTutorialSetting
{
    public int Id { get; set; } = 1;
    public string HeaderTitle { get; set; } = "";
    public string? VideoUrl { get; set; }
    public string CaptionTitle { get; set; } = "";
    public string CaptionDesc { get; set; } = "";
    public string DetailUrl { get; set; } = "";
    public int Revision { get; set; } = 1;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed record TutorialVideo(string HeaderTitle, string VideoUrl, string CaptionTitle = "",
    string CaptionDesc = "", string DetailUrl = "");
public sealed record TutorialConfiguration(TutorialVideo? Video, int Revision, DateTime UpdatedAt);
public sealed record TutorialInput(string HeaderTitle, string VideoUrl, int Revision,
    string? CaptionTitle = "", string? CaptionDesc = "", string? DetailUrl = "");

public static class TutorialValidation
{
    public static bool SafeUrl(string value)
    {
        if (value.Length is 0 or > 2048 || value.Any(char.IsControl) || value.Contains('\\')) return false;
        if (value.StartsWith('/') && !value.StartsWith("//")) return true;
        return Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps &&
            uri.UserInfo.Length == 0 && !uri.IsLoopback;
    }

    public static void Validate(TutorialInput input)
    {
        if (input.Revision < 1) throw new CardError(400, "Thiếu phiên bản cấu hình. Vui lòng tải lại.");
        if (string.IsNullOrWhiteSpace(input.HeaderTitle) || input.HeaderTitle.Trim().Length > 160)
            throw new CardError(400, "Tiêu đề phải có từ 1 đến 160 ký tự.");
        if (string.IsNullOrWhiteSpace(input.VideoUrl) || !SafeUrl(input.VideoUrl.Trim()))
            throw new CardError(400, "Nhập đường dẫn video HTTPS hoặc đường dẫn bắt đầu bằng /.");
        if ((input.CaptionTitle?.Length ?? 0) > 160 || (input.CaptionDesc?.Length ?? 0) > 2000)
            throw new CardError(400, "Tiêu đề mô tả tối đa 160 ký tự; nội dung tối đa 2000 ký tự.");
        if (!string.IsNullOrWhiteSpace(input.DetailUrl) && !SafeUrl(input.DetailUrl.Trim()))
            throw new CardError(400, "Liên kết xem thêm phải là HTTPS hoặc đường dẫn bắt đầu bằng /.");
        if (!Uri.TryCreate(input.VideoUrl.Trim(), UriKind.Absolute, out var uri)) return;
        var host = uri.Host.ToLowerInvariant();
        if (host is not ("youtube.com" or "www.youtube.com" or "m.youtube.com" or "youtu.be" or "www.youtu.be")) return;
        var id = host.EndsWith("youtu.be") ? uri.AbsolutePath.Trim('/') :
            uri.AbsolutePath == "/watch" ? uri.Query.TrimStart('?').Split('&')
                .FirstOrDefault(part => part.StartsWith("v="))?[2..] :
            Regex.Match(uri.AbsolutePath, @"^/(?:embed|shorts|v)/([A-Za-z0-9_-]{11})/?$").Groups[1].Value;
        if (id is null || !Regex.IsMatch(id, @"^[A-Za-z0-9_-]{11}$"))
            throw new CardError(400, "Đường dẫn YouTube không hợp lệ. Vui lòng dùng liên kết tới một video.");
    }
}

public sealed class TutorialVideoService(CardDatabase database)
{
    private static TutorialConfiguration View(CardTutorialSetting row) => new(
        row.VideoUrl is null ? null : new(row.HeaderTitle, row.VideoUrl, row.CaptionTitle, row.CaptionDesc, row.DetailUrl),
        row.Revision, row.UpdatedAt);

    public async Task<TutorialConfiguration> Get(CancellationToken ct) =>
        View(await database.TutorialSettings.AsNoTracking().SingleAsync(ct));

    public async Task<TutorialConfiguration> Save(TutorialInput input, CancellationToken ct)
    {
        TutorialValidation.Validate(input);
        var updatedAt = DateTime.UtcNow;
        var changed = await database.TutorialSettings.Where(row => row.Id == 1 && row.Revision == input.Revision)
            .ExecuteUpdateAsync(update => update
                .SetProperty(row => row.HeaderTitle, input.HeaderTitle.Trim())
                .SetProperty(row => row.VideoUrl, input.VideoUrl.Trim())
                .SetProperty(row => row.CaptionTitle, (input.CaptionTitle ?? "").Trim())
                .SetProperty(row => row.CaptionDesc, (input.CaptionDesc ?? "").Trim())
                .SetProperty(row => row.DetailUrl, (input.DetailUrl ?? "").Trim())
                .SetProperty(row => row.Revision, row => row.Revision + 1)
                .SetProperty(row => row.UpdatedAt, updatedAt), ct);
        if (changed != 1) throw Conflict();
        return new(new(input.HeaderTitle.Trim(), input.VideoUrl.Trim(), (input.CaptionTitle ?? "").Trim(),
            (input.CaptionDesc ?? "").Trim(), (input.DetailUrl ?? "").Trim()), input.Revision + 1, updatedAt);
    }

    public async Task<TutorialConfiguration> Delete(int revision, CancellationToken ct)
    {
        if (revision < 1) throw new CardError(400, "Thiếu phiên bản cấu hình. Vui lòng tải lại.");
        var updatedAt = DateTime.UtcNow;
        var changed = await database.TutorialSettings.Where(row => row.Id == 1 && row.Revision == revision)
            .ExecuteUpdateAsync(update => update.SetProperty(row => row.VideoUrl, (string?)null)
                .SetProperty(row => row.HeaderTitle, "").SetProperty(row => row.CaptionTitle, "")
                .SetProperty(row => row.CaptionDesc, "").SetProperty(row => row.DetailUrl, "")
                .SetProperty(row => row.Revision, row => row.Revision + 1)
                .SetProperty(row => row.UpdatedAt, updatedAt), ct);
        if (changed != 1) throw Conflict();
        return new(null, revision + 1, updatedAt);
    }

    private static CardError Conflict() => new(409, "Video đã được thay đổi. Vui lòng tải lại trước khi sửa hoặc xóa.");
}
