using System.Text.Json;
using System.Text.RegularExpressions;

namespace CraftVision.CardSharing;

public sealed class CardError(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}
public sealed class CardValidator
{
    private readonly JsonElement schemas;
    public CardValidator()
    {
        using var stream = typeof(CardValidator).Assembly.GetManifestResourceStream("CardSharing.fields.json")!;
        schemas = JsonSerializer.Deserialize<JsonElement>(stream);
    }
    public Dictionary<Guid, string> Validate(JsonElement draft)
    {
        var assets = new Dictionary<Guid, string>();
        if (draft.ValueKind != JsonValueKind.Object || System.Text.Encoding.UTF8.GetByteCount(draft.GetRawText()) > 262144 ||
            !draft.TryGetProperty("version", out var version) || version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out var v) || v != 1 ||
            !draft.TryGetProperty("template", out var template) || template.ValueKind != JsonValueKind.String ||
            !schemas.TryGetProperty(template.GetString()!, out var fields) ||
            !draft.TryGetProperty("values", out var values) || values.ValueKind != JsonValueKind.Object)
            throw new CardError(400, "Dữ liệu hoặc mẫu thiệp không hợp lệ.");
        var allowed = fields.EnumerateArray().Select(f => f.GetProperty("key").GetString()).ToHashSet();
        if (values.EnumerateObject().Any(p => !allowed.Contains(p.Name))) throw new CardError(400, "Thiệp chứa trường không hỗ trợ.");
        foreach (var field in fields.EnumerateArray())
        {
            var key = field.GetProperty("key").GetString()!;
            var type = field.GetProperty("type").GetString()!;
            var required = field.TryGetProperty("required", out var r) && r.GetBoolean();
            if (!values.TryGetProperty(key, out var value)) { if (required) Invalid(key); continue; }
            var max = field.TryGetProperty("max", out var m) ? m.GetInt32() : 12;
            if (type is "images" or "list")
            {
                if (value.ValueKind != JsonValueKind.Array || value.GetArrayLength() > max || (required && value.GetArrayLength() == 0) || (key == "memories" && value.GetArrayLength() < 2)) Invalid(key);
                foreach (var row in value.EnumerateArray())
                {
                    if (type == "images") Media(row, "image", assets);
                    else
                    {
                        if (row.ValueKind != JsonValueKind.Object) Invalid(key);
                        var columns = field.GetProperty("columns").EnumerateArray().Select(c => c.GetString()).ToHashSet();
                        var firstColumn = field.GetProperty("columns")[0].GetString()!;
                        if (!row.TryGetProperty(firstColumn, out var title) || title.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(title.GetString())) Invalid(key);
                        foreach (var col in row.EnumerateObject())
                            if (!columns.Contains(col.Name) || col.Value.ValueKind != JsonValueKind.String || col.Value.GetString()!.Length > 500) Invalid(key);
                    }
                }
                continue;
            }
            if (value.ValueKind != JsonValueKind.String) Invalid(key);
            var text = value.GetString()!;
            if (text.Length > 5000 || (required && string.IsNullOrWhiteSpace(text))) Invalid(key);
            if (type is "image" or "audio") { if (text.Length > 0) Media(value, type, assets); }
            else if (type == "color" && text.Length > 0 && !Regex.IsMatch(text, "^#[a-fA-F0-9]{6}$")) Invalid(key);
            else if (type == "select" && !field.GetProperty("options").EnumerateArray().Any(o => o.GetString() == text)) Invalid(key);
            else if (type == "number" && text.Length > 0 && (!int.TryParse(text, out var n) || n < 0 || n > (key == "year" ? 9999 : 150))) Invalid(key);
            else if (type == "date" && text.Length > 0 && !DateOnly.TryParseExact(text, "yyyy-MM-dd", out _)) Invalid(key);
        }
        return assets;
    }
    private static void Media(JsonElement value, string kind, Dictionary<Guid, string> assets)
    {
        if (value.ValueKind != JsonValueKind.String) Invalid("media");
        var match = Regex.Match(value.GetString()!, "^/api/cards/media/([0-9a-fA-F-]{36})$");
        if (!match.Success || !Guid.TryParse(match.Groups[1].Value, out var id)) { Invalid("media"); return; }
        if (assets.TryGetValue(id, out var prior) && prior != kind) Invalid("media");
        assets[id] = kind;
    }
    private static void Invalid(string key) => throw new CardError(400, $"Nội dung {key} không hợp lệ.");
}
