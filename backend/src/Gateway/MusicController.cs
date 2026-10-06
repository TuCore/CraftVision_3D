using System.ComponentModel.DataAnnotations;
using CraftVision.Music;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CraftVision.Gateway;

public sealed class MusicTrackForm
{
    [Required, StringLength(120)] public string Title { get; set; } = "";
    [StringLength(2048)] public string? AudioUrl { get; set; }
    public bool IsEnabled { get; set; } = true;
    [Range(0, 10000)] public int SortOrder { get; set; }
    public int Revision { get; set; }
    public IFormFile? File { get; set; }

    public async Task<TrackInput> Read(CancellationToken ct)
    {
        byte[]? bytes = null;
        if (File is not null)
        {
            if (File.Length > MusicValidation.MaxBytes) throw new MusicError(413, "Tệp nhạc tối đa 15 MB.");
            using var buffer = new MemoryStream();
            await File.CopyToAsync(buffer, ct);
            bytes = buffer.ToArray();
        }
        return new(Title, AudioUrl, IsEnabled, SortOrder, Revision, bytes);
    }
}

// Gateway adapter hosted by Presentation, matching the existing CardSharing module.
[ApiController, Route("api/music")]
[ServiceFilter(typeof(MusicErrorFilter))]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class MusicController(IServiceProvider services) : ControllerBase
{
    private MusicService Music => services.GetService<MusicService>() ??
        throw new MusicError(503, "Chưa cấu hình ConnectionStrings:Music trên server.");

    [AllowAnonymous, HttpGet]
    public async Task<IActionResult> Playlist(CancellationToken ct)
    {
        var music = services.GetService<MusicService>();
        return Ok(music is null ? Array.Empty<TrackView>() : await music.List(false, ct));
    }

    [Authorize(Roles = "Admin"), HttpGet("tracks")]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await Music.List(true, ct));

    [Authorize(Roles = "Admin"), HttpPost("tracks")]
    [RequestSizeLimit(MusicValidation.MaxBytes + 65536), RequestFormLimits(MultipartBodyLengthLimit = MusicValidation.MaxBytes + 65536)]
    public async Task<IActionResult> Create([FromForm] MusicTrackForm form, CancellationToken ct)
    {
        var track = await Music.Save(null, await form.Read(ct), ct);
        return Created($"/api/music/tracks/{track.Id}", track);
    }

    [Authorize(Roles = "Admin"), HttpPut("tracks/{id:guid}")]
    [RequestSizeLimit(MusicValidation.MaxBytes + 65536), RequestFormLimits(MultipartBodyLengthLimit = MusicValidation.MaxBytes + 65536)]
    public async Task<IActionResult> Update(Guid id, [FromForm] MusicTrackForm form, CancellationToken ct) =>
        Ok(await Music.Save(id, await form.Read(ct), ct));

    [Authorize(Roles = "Admin"), HttpDelete("tracks/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] int revision, CancellationToken ct)
    {
        await Music.Delete(id, revision, ct);
        return NoContent();
    }

    [AllowAnonymous, HttpGet("tracks/{id:guid}/audio")]
    public async Task<IActionResult> Audio(Guid id, CancellationToken ct)
    {
        var audio = await Music.Audio(id, User.IsInRole("Admin"), ct);
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return File(audio.Bytes, audio.ContentType, enableRangeProcessing: true);
    }
}

public sealed class MusicErrorFilter(ILogger<MusicErrorFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var error = context.Exception as MusicError;
        if (error is null) logger.LogError(context.Exception, "Music request failed");
        context.Result = new ObjectResult(new { message = error?.Message ?? "Dịch vụ nhạc tạm thời không khả dụng. Vui lòng thử lại." })
            { StatusCode = error?.Status ?? 503 };
        context.ExceptionHandled = true;
    }
}
