using System.Security.Claims;
using CraftVision.Application.DTOs.Mobile;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[Authorize]
public abstract class CurrentUserController : ControllerBase
{
    protected Guid UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : throw new UnauthorizedAccessException("User must be logged in.");
}

[ApiController, Route("api/favorites")]
public class FavoritesController(IFavoriteService service) : CurrentUserController
{
    [HttpGet] public async Task<IActionResult> Get() => Ok(await service.GetAsync(UserId));
    [HttpPost("{productId:guid}")] public async Task<IActionResult> Add(Guid productId) => Ok(await service.AddAsync(UserId, productId));
    [HttpDelete("{productId:guid}")] public async Task<IActionResult> Remove(Guid productId) { await service.RemoveAsync(UserId, productId); return NoContent(); }
}

[ApiController, Route("api/vouchers")]
public class VouchersController(IVoucherService service) : ControllerBase
{
    [HttpPost("validate")] public async Task<IActionResult> Validate(VoucherValidationRequest request) => Ok(await service.ValidateAsync(request));
}

[ApiController, Route("api/shipping")]
public class ShippingController(IShippingService service) : ControllerBase
{
    [HttpGet("methods")] public IActionResult Methods() => Ok(service.GetMethods());
    [HttpPost("quote")] public IActionResult Quote(ShippingQuoteRequest request) => Ok(service.Quote(request));
}

[ApiController, Route("api/notifications")]
public class NotificationsController(INotificationService service) : CurrentUserController
{
    [HttpGet] public async Task<IActionResult> Get([FromQuery] bool unreadOnly = false) => Ok(await service.GetAsync(UserId, unreadOnly));
    [HttpPatch("{id:guid}/read")] public async Task<IActionResult> Read(Guid id) { await service.MarkReadAsync(UserId, id); return NoContent(); }
    [HttpPatch("read-all")] public async Task<IActionResult> ReadAll() { await service.MarkAllReadAsync(UserId); return NoContent(); }
    [HttpPost("devices")] public async Task<IActionResult> RegisterDevice(RegisterPushTokenRequest request) { await service.RegisterPushTokenAsync(UserId, request); return NoContent(); }
}

[ApiController, Route("api/auth")]
public class PasswordController(IPasswordResetService service) : ControllerBase
{
    [AllowAnonymous, HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot(ForgotPasswordRequest request)
    {
        await service.RequestAsync(request.Email);
        return Ok(new { message = "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi." });
    }

    [AllowAnonymous, HttpPost("reset-password")]
    public async Task<IActionResult> Reset(ResetPasswordRequest request)
    {
        await service.ResetAsync(request.Token, request.NewPassword);
        return Ok(new { message = "Mật khẩu đã được cập nhật." });
    }
}

[ApiController, Route("api/payments")]
public class PaymentsController(IPaymentService service) : CurrentUserController
{
    [HttpPost] public async Task<IActionResult> Create(CreatePaymentRequest request) => Ok(await service.CreateAsync(UserId, request));
    [HttpGet("orders/{orderId:guid}")] public async Task<IActionResult> Status(Guid orderId) => Ok(await service.GetStatusAsync(UserId, orderId));
}
