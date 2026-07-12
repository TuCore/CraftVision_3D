using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/gifts")]
public class GiftController : ControllerBase
{
    private readonly IGiftService _service;

    public GiftController(IGiftService service)
    {
        _service = service;
    }

    [HttpGet("scan/{secretKey}")]
    public async Task<IActionResult> ScanGift(string secretKey)
    {
        var result = await _service.GetGiftPageBySecretKeyAsync(secretKey);
        return Ok(result);
    }
}
