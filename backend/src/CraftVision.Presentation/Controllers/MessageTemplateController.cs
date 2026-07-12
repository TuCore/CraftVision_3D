using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.MessageTemplate;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/message-templates")]
public class MessageTemplateController : ControllerBase
{
    private readonly IMessageTemplateService _service;

    public MessageTemplateController(IMessageTemplateService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("category/{categoryId:guid}")]
    public async Task<IActionResult> GetByCategory(Guid categoryId)
    {
        return Ok(await _service.GetByCategoryIdAsync(categoryId));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMessageTemplateDto dto)
    {
        return Ok(await _service.CreateAsync(dto));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateMessageTemplateDto dto)
    {
        return Ok(await _service.UpdateAsync(id, dto));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
