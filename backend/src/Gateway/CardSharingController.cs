using System.Security.Claims;
using System.Text.Json;
using CraftVision.CardSharing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CraftVision.Gateway;

public sealed record DraftRequest(JsonElement Draft, int Revision = 0);
public sealed record RevisionRequest(int Revision);

// Gateway adapter hosted by Presentation until the existing gateway is extracted.
[ApiController, Route("api/cards"), Authorize]
[ServiceFilter(typeof(CardErrorFilter))]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class CardSharingController(IServiceProvider services, IHttpClientFactory clients) : ControllerBase
{
    private CardService Cards => services.GetService<CardService>() ?? throw new CardError(503, "Chưa cấu hình ConnectionStrings:Cards trên server.");
    private CardMedia Media => services.GetService<CardMedia>() ?? throw new CardError(503, "Chưa cấu hình ConnectionStrings:Cards trên server.");
    private Guid Owner => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : throw new CardError(401, "Vui lòng đăng nhập lại.");
    [HttpGet] public async Task<IActionResult> List(CancellationToken ct) => Ok(await Cards.List(Owner, ct));
    [HttpGet("{id:guid}")] public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(CardService.View(await Cards.Find(Owner, id, ct)));
    [HttpPost, RequestSizeLimit(270000)] public async Task<IActionResult> Create(DraftRequest body, CancellationToken ct)
    {
        var card = await Cards.Create(Owner, body.Draft, ct); return Created($"/api/cards/{card.Id}", card);
    }
    [HttpPut("{id:guid}"), RequestSizeLimit(270000)] public async Task<IActionResult> Update(Guid id, DraftRequest body, CancellationToken ct) => Ok(await Cards.Update(Owner, id, body.Revision, body.Draft, ct));
    [HttpPost("{id:guid}/publish")] public async Task<IActionResult> Publish(Guid id, RevisionRequest body, CancellationToken ct) => Ok(await Cards.Publish(Owner, id, body.Revision, false, ct));
    [HttpDelete("{id:guid}/publication")] public async Task<IActionResult> Revoke(Guid id, [FromBody] RevisionRequest body, CancellationToken ct) => Ok(await Cards.Publish(Owner, id, body.Revision, true, ct));
    [AllowAnonymous, HttpGet("public/{token}")] public async Task<IActionResult> Public(string token, CancellationToken ct)
    {
        Response.Headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";
        return Ok(await Cards.Public(token, ct));
    }
    [HttpPost("media"), RequestSizeLimit(CardMedia.MaxBytes + 65536), RequestFormLimits(MultipartBodyLengthLimit = CardMedia.MaxBytes + 65536)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file.Length > CardMedia.MaxBytes) throw new CardError(413, "Tệp tối đa 8 MB.");
        var owner = Owner;
        using var buffer = new MemoryStream(); await file.CopyToAsync(buffer, ct);
        var asset = await Media.Upload(owner, buffer.ToArray(), ct);
        return Ok(new { url = $"/api/cards/media/{asset.Id}" });
    }
    [AllowAnonymous, HttpGet("media/{id:guid}")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        Guid? owner = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null;
        var asset = await Media.Get(id, owner, ct);
        using var response = await clients.CreateClient("CardAssets").GetAsync(asset.StorageUrl, ct);
        if (!response.IsSuccessStatusCode) throw new CardError(502, "Không thể tải media. Vui lòng thử lại.");
        var bytes = await response.Content.ReadAsByteArrayAsync(ct);
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers["X-Robots-Tag"] = "noindex";
        return File(bytes, asset.ContentType);
    }
}
public sealed class CardErrorFilter(ILogger<CardErrorFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var error = context.Exception as CardError;
        if (error is null) logger.LogError(context.Exception, "Card sharing request failed");
        context.Result = new ObjectResult(new { message = error?.Message ?? "Dịch vụ thiệp đang tạm gián đoạn. Vui lòng thử lại." }) { StatusCode = error?.Status ?? 503 };
        context.ExceptionHandled = true;
    }
}
