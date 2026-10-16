namespace CraftVision.Application.DTOs.Mobile;

public record CartItemRequest(Guid ProductId, int Quantity = 1);
public record UpdateCartItemRequest(int Quantity);
public record CartItemDto(Guid Id, Guid ProductId, string Name, decimal UnitPrice, int Quantity, decimal SubTotal, string? ImageUrl);
public record CartDto(IReadOnlyList<CartItemDto> Items, int TotalQuantity, decimal TotalAmount);
public record FavoriteDto(Guid Id, Guid ProductId, string Name, decimal Price, string? ImageUrl, DateTime CreatedAt);
public record VoucherValidationRequest(string Code, decimal OrderAmount);
public record VoucherValidationDto(bool IsValid, string? Message, decimal DiscountAmount, decimal FinalAmount);
public record ShippingQuoteRequest(string Province, string District, decimal OrderAmount);
public record ShippingMethodDto(string Code, string Name, decimal Fee, int EstimatedDays);
public record NotificationDto(Guid Id, string Title, string Body, string Type, bool IsRead, DateTime CreatedAt);
public record RegisterPushTokenRequest(string Token, string Platform);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);
public record CreatePaymentRequest(Guid OrderId, string ReturnUrl, string CancelUrl);
public record PaymentDto(Guid OrderId, string OrderCode, string PaymentStatus, string? CheckoutUrl);
