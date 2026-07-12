using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.NfcTag;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/nfc-tags")]
[Authorize(Roles = "Admin")]
public class NfcController : ControllerBase
{
    private readonly INfcTagService _service;

    public NfcController(INfcTagService service)
    {
        _service = service;
    }

    [HttpPost("batch")]
    public async Task<IActionResult> ImportTags([FromBody] ImportNfcTagDto dto)
    {
        var result = await _service.ImportTagsAsync(dto);
        return Ok(result);
    }

    [HttpGet("{tagCode}")]
    public async Task<IActionResult> GetTag(string tagCode)
    {
        return Ok(await _service.GetTagByCodeAsync(tagCode));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] CraftVision.Application.DTOs.Common.UpdateStatusDto dto)
    {
        await _service.UpdateTagStatusAsync(id, dto.Status);
        return NoContent();
    }
}
