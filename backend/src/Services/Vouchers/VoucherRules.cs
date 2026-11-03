using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using System.Security.Cryptography;

namespace CraftVision.Vouchers;

public static class VoucherRules
{
    public static void ValidatePercent(int percent)
    {
        if (percent is < 1 or > 100) throw new ArgumentException("Phần trăm giảm phải từ 1 đến 100.");
    }

    public static string GenerateCode() => RandomNumberGenerator.GetString("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

    public static CheckoutQuote Discount(CheckoutQuote quote, int percent, string code)
    {
        ValidatePercent(percent);
        var discount = Math.Round(quote.OriginalTotal * percent / 100m, 0, MidpointRounding.AwayFromZero);
        var shipping = quote.OriginalTotal == 0 ? 0 : Math.Min(quote.ShippingFee,
            Math.Round(discount * quote.ShippingFee / quote.OriginalTotal, 0, MidpointRounding.AwayFromZero));
        return quote with { DiscountPercent = percent, VoucherCode = code, DiscountAmount = discount,
            ShippingDiscount = shipping, MerchandiseDiscount = discount - shipping,
            TotalAmount = quote.OriginalTotal - discount };
    }

    public static void Transition(VoucherUsage usage, Order order, bool paymentClosed, DateTime now)
    {
        if (usage.Status != "Reserved") return;
        if (order.PaymentStatus == PaymentStatus.Paid && order.OrderStatus == OrderStatus.Delivered)
        {
            usage.Status = "Used"; usage.UsedAt = now; usage.ExpiresAt = null; usage.Revision++;
        }
        else if (order.OrderStatus == OrderStatus.Cancelled &&
            (order.PaymentStatus == PaymentStatus.Refunded || (order.PaymentStatus == PaymentStatus.Unpaid && paymentClosed)))
        {
            usage.Status = "Released"; usage.ReleasedAt = now; usage.ExpiresAt = null; usage.Revision++;
        }
        else if (order.PaymentStatus == PaymentStatus.Paid) usage.ExpiresAt = null;
    }
}
