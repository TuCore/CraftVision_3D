using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Order;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly IUnitOfWork _work;

    public OrderController(IOrderService service, IUnitOfWork work)
    {
        _service = service;
        _work = work;
    }

    private async Task<bool> CanAccess(Guid id)
    {
        if (User.IsInRole("Admin")) return true;
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var user) &&
            (await _work.Orders.GetByIdWithItemsAsync(id))?.UserId == user;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) 
        {
            return Unauthorized("User must be logged in to place an order.");
        }

        var result = await _service.CreateOrderAsync(userId, dto);
        return CreatedAtAction(nameof(GetOrderById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        if (!await CanAccess(id)) return NotFound();
        return Ok(await _service.GetOrderByIdAsync(id));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetUserOrders([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        return Ok(await _service.GetUserOrdersAsync(userId, page, size));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        return Ok(await _service.GetAllOrdersAsync(page, size));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] CraftVision.Application.DTOs.Common.UpdateStatusDto dto)
    {
        await _service.UpdateOrderStatusAsync(id, dto.Status);
        return NoContent();
    }

    [HttpPatch("{id:guid}/payment-status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] CraftVision.Application.DTOs.Common.UpdateStatusDto dto)
    {
        await _service.UpdatePaymentStatusAsync(id, dto.Status);
        return NoContent();
    }

    [HttpPatch("{id:guid}/simulate-payment")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SimulatePayment(Guid id, [FromServices] Microsoft.Extensions.Hosting.IHostEnvironment environment)
    {
        if (environment.EnvironmentName != "Development") return NotFound();
        await _service.SimulatePaymentAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/payment-link")]
    public async Task<IActionResult> RegeneratePaymentLink(Guid id)
    {
        if (!await CanAccess(id)) return NotFound();
        return Ok(await _service.GetOrRegeneratePaymentLinkAsync(id));
    }

    [HttpGet("{id:guid}/check-payment")]
    public async Task<IActionResult> CheckPaymentStatus(Guid id)
    {
        if (!await CanAccess(id)) return NotFound();
        var isPaid = await _service.CheckAndUpdatePaymentStatusAsync(id);
        return Ok(new { isPaid });
    }

    [HttpPatch("{id:guid}/receive")]
    public async Task<IActionResult> ReceiveOrder(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        await _service.CompleteUserOrderAsync(userId, id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        await _service.CancelUserOrderAsync(userId, id);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        await _service.DeleteOrderAsync(id);
        return NoContent();
    }
}
