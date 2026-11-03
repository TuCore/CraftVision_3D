using System.Security.Claims;
using CraftVision.Application.DTOs.Order;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Gateway;

[ApiController, Route("api/checkout"), Authorize, ServiceFilter(typeof(VoucherErrorFilter))]
public sealed class CheckoutController(IWebVoucherService vouchers) : ControllerBase
{
    [HttpPost("quote")] public async Task<IActionResult> Quote(CreateOrderDto request, CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var user)) return Unauthorized();
        return Ok(await vouchers.QuoteAsync(user, request, ct));
    }
}
