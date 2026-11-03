namespace CraftVision.Application.DTOs.Vouchers;

public sealed record VoucherSettings(int DiscountPercent, int CustomerLimit, DateTime? EndsAt, bool IsActive, int? Revision = null);
public sealed record VoucherView(Guid Id, string Code, int DiscountPercent, int CustomerLimit,
    int Reserved, int Used, int Available, bool IsActive, DateTime? EndsAt, DateTime CreatedAt, int Revision);
public sealed record VoucherUsageView(Guid Id, Guid UserId, string Customer, Guid OrderId, string OrderCode,
    string Status, string PaymentStatus, string OrderStatus, decimal DiscountAmount,
    DateTime ReservedAt, DateTime? ExpiresAt, DateTime? UsedAt, DateTime? ReleasedAt);
public sealed record VoucherUsagePage(IReadOnlyList<VoucherUsageView> Items, int TotalItems, int Page, int PageSize = 20);
public sealed record PricedLine(Guid ProductId, int Quantity, decimal UnitPrice);
public sealed record CheckoutQuote(decimal Subtotal, decimal ShippingFee, decimal OriginalTotal,
    decimal DiscountAmount, decimal MerchandiseDiscount, decimal ShippingDiscount, decimal TotalAmount,
    string? VoucherCode, int DiscountPercent, IReadOnlyList<PricedLine> Lines);
