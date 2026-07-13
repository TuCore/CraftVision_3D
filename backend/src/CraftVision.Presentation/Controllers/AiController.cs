using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _service;

    public AiController(IAiService service)
    {
        _service = service;
    }

    [HttpPost("messages")]
    public async Task<IActionResult> GenerateMessage([FromBody] GenerateGiftMessageDto dto)
    {
        return Ok(await _service.GenerateMessageAsync(dto));
    }

    [HttpPost("models")]
    public async Task<IActionResult> Generate3DModel([FromBody] GenerateGift3DDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        return Ok(await _service.Generate3DModelAsync(userId, dto));
    }

    [HttpGet("models/{taskId:guid}")]
    public async Task<IActionResult> Get3DTaskStatus(Guid taskId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        return Ok(await _service.Get3DTaskStatusAsync(userId, taskId));
    }
}
