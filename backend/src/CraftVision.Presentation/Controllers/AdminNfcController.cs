using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.NfcTag;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/admin/nfc")]
public class AdminNfcController : ControllerBase
{
    private readonly INfcTagService _service;

    public AdminNfcController(INfcTagService service)
    {
        _service = service;
    }

    [HttpPost("import")]
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

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        await _service.UpdateTagStatusAsync(id, status);
        return NoContent();
    }
}
