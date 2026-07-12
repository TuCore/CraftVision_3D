using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Order;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/orders")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _service;

    public OrderController(IOrderService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        // Mock userId
        var userId = Guid.NewGuid();
        return Ok(await _service.CreateOrderAsync(userId, dto));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        return Ok(await _service.GetOrderByIdAsync(id));
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetUserOrders([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        // Mock userId
        var userId = Guid.NewGuid();
        return Ok(await _service.GetUserOrdersAsync(userId, page, size));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        await _service.UpdateOrderStatusAsync(id, status);
        return NoContent();
    }
}
