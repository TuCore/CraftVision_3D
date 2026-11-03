using System.Security.Claims;
using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Vouchers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Gateway;

public sealed class VoucherErrorFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var status = context.Exception switch { VoucherError e => e.Status, DbUpdateConcurrencyException => 409, ArgumentException => 400, _ => 0 };
        if (status == 0) return;
        context.Result = new ObjectResult(new { message = status == 409 && context.Exception is DbUpdateConcurrencyException
            ? "Dữ liệu vừa thay đổi. Hãy tải lại và thử lại." : context.Exception.Message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}

[ApiController, Route("api/admin/vouchers"), Authorize(Roles = "Admin"), ServiceFilter(typeof(VoucherErrorFilter))]
public sealed class VouchersController(IWebVoucherService vouchers) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> List(CancellationToken ct) => Ok(await vouchers.ListAsync(ct));
    [HttpPost] public async Task<IActionResult> Create(VoucherSettings settings, CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var user)) return Unauthorized();
        var result = await vouchers.CreateAsync(user, settings, ct);
        return StatusCode(201, result);
    }
    [HttpPatch("{id:guid}")] public async Task<IActionResult> Update(Guid id, VoucherSettings settings, CancellationToken ct) => Ok(await vouchers.UpdateAsync(id, settings, ct));
    [HttpGet("{id:guid}/usages")] public async Task<IActionResult> Usages(Guid id, [FromQuery] int page = 1, CancellationToken ct = default) => Ok(await vouchers.UsagesAsync(id, page, ct));
}
