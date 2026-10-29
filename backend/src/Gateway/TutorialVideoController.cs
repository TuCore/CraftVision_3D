using CraftVision.CardSharing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace CraftVision.Gateway;

[ApiController, Route("api/tutorial-video")]
[ServiceFilter(typeof(CardErrorFilter))]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class TutorialVideoController(IServiceProvider services) : ControllerBase
{
    private TutorialVideoService Tutorial => services.GetService<TutorialVideoService>() ??
        throw new CardError(503, "Chưa cấu hình ConnectionStrings:Cards trên server.");

    [AllowAnonymous, HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(await Tutorial.Get(ct));

    [Authorize(Roles = "Admin"), HttpPut, RequestSizeLimit(16384)]
    public async Task<IActionResult> Save(TutorialInput input, CancellationToken ct) => Ok(await Tutorial.Save(input, ct));

    [Authorize(Roles = "Admin"), HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] int revision, CancellationToken ct) => Ok(await Tutorial.Delete(revision, ct));
}
