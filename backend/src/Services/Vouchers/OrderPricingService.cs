using System.Text.Json;
using CraftVision.Application.DTOs.Order;
using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Vouchers;

public sealed class OrderPricingService(ApplicationDbContext db) : IOrderPricingService
{
    private static readonly Dictionary<string, int> Prices = LoadPrices();
    private static Dictionary<string, int> LoadPrices()
    {
        using var stream = typeof(OrderPricingService).Assembly.GetManifestResourceStream("Vouchers.card-prices.json")!;
        return JsonSerializer.Deserialize<Dictionary<string, int>>(stream)!;
    }

    public static decimal Shipping(string? address, decimal subtotal, bool physical)
    {
        if (!physical || subtotal >= 500000) return 0;
        if (string.IsNullOrWhiteSpace(address) || address.Trim().Equals("Online", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Vui lòng nhập địa chỉ giao hàng trước khi tính tiền.");
        var value = address.ToLowerInvariant();
        if (value.Contains("thủ đức") || value.Contains("thu duc")) return 0;
        return value.Contains("hồ chí minh") || value.Contains("ho chi minh") || value.Contains("hcm") ? 20000 : 35000;
    }

    public async Task<CheckoutQuote> PriceAsync(CreateOrderDto request, CancellationToken ct = default)
    {
        if (request.PricingVersion != 1 || request.Items is not { Count: > 0 and <= 100 })
            throw new ArgumentException("Dữ liệu thanh toán không hợp lệ.");
        var lines = new List<PricedLine>();
        var physical = false;
        ProductType? commonType = null;
        foreach (var item in request.Items)
        {
            if (item.Quantity is < 1 or > 1000) throw new ArgumentException("Số lượng phải từ 1 đến 1000.");
            var digital = item.CardType == "digital";
            var product = item.ProductId == Guid.Empty && digital
                ? await db.Products.Where(p => p.Name.Contains("Thiệp 3D")).OrderBy(p => p.CreatedAt).FirstOrDefaultAsync(ct)
                : await db.Products.SingleOrDefaultAsync(p => p.Id == item.ProductId, ct);
            if (product is null || !product.IsActive || product.IsComingSoon)
                throw new ArgumentException("Sản phẩm không tồn tại hoặc chưa được bán.");
            if (commonType.HasValue && commonType != product.ProductType)
                throw new ArgumentException("Không thể đặt sản phẩm có sẵn và PreOrder trong cùng đơn.");
            commonType = product.ProductType;
            decimal extra = item.CardType switch
            {
                "none" => 0,
                "default" => 5000,
                "web_library_3d" => Math.Round(CardPrice(item.CardSlug) * .8m, 0, MidpointRounding.AwayFromZero),
                "digital" => 0,
                _ => throw new ArgumentException("Loại thiệp không hợp lệ.")
            };
            if (item.CardType is "default" or "web_library_3d" && (!item.WantNfc || item.Gift is null))
                throw new ArgumentException("Thiếu thông tin thiệp đi kèm.");
            if (item.CardType == "none" && item.Gift is not null && item.Gift.Theme != "craft-certificate")
                throw new ArgumentException("Vui lòng chọn loại thiệp phù hợp.");
            if (product.Price < 0 || product.Price != decimal.Truncate(product.Price))
                throw new ArgumentException("Giá sản phẩm phải là số tiền VND hợp lệ.");
            physical |= !digital;
            lines.Add(new(product.Id, item.Quantity, digital ? CardPrice(item.CardSlug) : product.Price + extra));
        }
        foreach (var group in lines.GroupBy(l => l.ProductId))
        {
            var product = await db.Products.SingleAsync(p => p.Id == group.Key, ct);
            if (product.ProductType == ProductType.InStock && product.Stock < group.Sum(l => l.Quantity))
                throw new ArgumentException($"Sản phẩm '{product.Name}' không đủ số lượng.");
        }
        var subtotal = lines.Sum(l => l.UnitPrice * l.Quantity);
        var shipping = Shipping(request.ReceiverAddress, subtotal, physical);
        if (subtotal + shipping > int.MaxValue) throw new ArgumentException("Giá trị đơn hàng quá lớn.");
        return new(subtotal, shipping, subtotal + shipping, 0, 0, 0, subtotal + shipping, null, 0, lines);
    }

    private static int CardPrice(string? slug) => slug is not null && Prices.TryGetValue(slug, out var price)
        ? price : throw new ArgumentException("Mẫu thiệp chưa có giá hợp lệ.");
}
