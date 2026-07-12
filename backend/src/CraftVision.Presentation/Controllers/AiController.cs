using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/ai")]
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
        // Mock userId
        var userId = Guid.NewGuid();
        return Ok(await _service.Generate3DModelAsync(userId, dto));
    }

    [HttpGet("models/{taskId:guid}/status")]
    public async Task<IActionResult> Get3DTaskStatus(Guid taskId)
    {
        // Mock userId
        var userId = Guid.NewGuid();
        return Ok(await _service.Get3DTaskStatusAsync(userId, taskId));
    }
}
