using System.Runtime.CompilerServices;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CraftVision.Reporting;

// Compiled into commerce Infrastructure: queries only its own database. Card inventory is composed by the Gateway.
public sealed class CommerceReports(ApplicationDbContext db, IConfiguration configuration) : ICommerceReports
{
    private IQueryable<Order> Orders(ReportRequest request) => db.Orders.AsNoTracking()
        .Where(order => (request.Kind == "all" || order.OrderKind == request.Kind) &&
            (request.Method == "all" || order.PaymentMethod.ToString() == request.Method));
    private IQueryable<OrderFinancialEvent> Events(ReportRequest request) => db.OrderFinancialEvents.AsNoTracking()
        .Where(e => (request.Kind == "all" || e.OrderKind == request.Kind) &&
            (request.Method == "all" || e.PaymentMethod == request.Method));
    private IQueryable<OrderFinancialEvent> DatedEvents(ReportRequest request, ReportWindow window) => Events(request)
        .Where(e => e.OccurredAt >= window.Start && e.OccurredAt < window.End);

    private async Task<ReportMetrics> Metrics(ReportRequest request, ReportWindow window, CancellationToken ct)
    {
        var events = DatedEvents(request, window);
        var sums = await events.GroupBy(_ => 1).Select(g => new
        {
            Receipts = g.Sum(e => e.Kind == "Receipt" ? e.MerchandiseAmount : 0),
            Refunds = g.Sum(e => e.Kind == "Refund" ? e.MerchandiseAmount : 0),
            Shipping = g.Sum(e => e.Kind == "Receipt" ? e.ShippingAmount : -e.ShippingAmount),
            Paid = g.Count(e => e.Kind == "Receipt"), Cards = g.Count(e => e.Kind == "Receipt" && e.OrderKind == "DigitalCard"),
            RefundedCards = g.Count(e => e.Kind == "Refund" && e.OrderKind == "DigitalCard"),
        }).SingleOrDefaultAsync(ct);
        var lineSums = await db.OrderFinancialLines.Where(line => events.Where(e => e.OrderKind == "Product").Select(e => e.Id).Contains(line.EventId))
            .GroupBy(_ => 1).Select(g => new { Sold = g.Sum(l => l.Event!.Kind == "Receipt" ? l.Quantity : 0),
                Refunded = g.Sum(l => l.Event!.Kind == "Refund" ? l.Quantity : 0) }).SingleOrDefaultAsync(ct);
        var buyers = await events.Where(e => e.Kind == "Receipt").Select(e => e.UserId).Distinct().CountAsync(ct);
        var orders = await Orders(request).CountAsync(o => o.CreatedAt >= window.Start && o.CreatedAt < window.End, ct);
        return new((sums?.Receipts ?? 0) - (sums?.Refunds ?? 0), orders, sums?.Paid ?? 0, lineSums?.Sold ?? 0,
            sums?.Cards ?? 0, buyers, sums?.Receipts ?? 0, sums?.Refunds ?? 0, sums?.Shipping ?? 0, lineSums?.Refunded ?? 0, sums?.RefundedCards ?? 0);
    }

    public async Task<SummaryReport> Summary(ReportRequest request, CancellationToken ct)
    {
        var window = request.Window();
        var current = await Metrics(request, window, ct);
        var previous = await Metrics(request, window.Previous, ct);
        var unknown = await Events(request).Where(e => e.OccurredAt == null).GroupBy(_ => 1)
            .Select(g => new { Count = g.Count(), Net = g.Sum(e => e.Kind == "Receipt" ? e.MerchandiseAmount : -e.MerchandiseAmount) }).SingleOrDefaultAsync(ct);
        return new(current, previous, unknown?.Count ?? 0, unknown?.Net ?? 0, DateTime.UtcNow);
    }

    private Task<List<RevenueDay>> Days(ReportRequest request, ReportWindow window, CancellationToken ct) => DatedEvents(request, window)
        .GroupBy(e => e.OccurredAt!.Value.AddHours(7).Date).OrderBy(g => g.Key).Select(g => new RevenueDay(g.Key,
            g.Sum(e => e.Kind == "Receipt" ? e.MerchandiseAmount : 0), g.Sum(e => e.Kind == "Refund" ? e.MerchandiseAmount : 0),
            g.Sum(e => e.OrderKind == "Product" ? (e.Kind == "Receipt" ? e.MerchandiseAmount : -e.MerchandiseAmount) : 0),
            g.Sum(e => e.OrderKind == "DigitalCard" ? (e.Kind == "Receipt" ? e.MerchandiseAmount : -e.MerchandiseAmount) : 0)))
        .ToListAsync(ct);

    public async Task<RevenueReport> Revenue(ReportRequest request, CancellationToken ct)
    {
        var window = request.Window();
        var days = await Days(request, window, ct);
        var previous = await Days(request, window.Previous, ct);
        var statuses = await Orders(request).Where(o => o.CreatedAt >= window.Start && o.CreatedAt < window.End)
            .GroupBy(o => o.OrderStatus).Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(ct);
        return new(ReportSeries.Build(window, request.GroupBy, days, previous),
            [new("Product", days.Sum(d => d.ProductRevenue)), new("DigitalCard", days.Sum(d => d.CardRevenue))],
            statuses.Select(s => new ReportSlice(s.Status.ToString(), s.Count)).ToList(), DateTime.UtcNow);
    }

    public async Task<TopSellingReport> TopSelling(ReportRequest request, CancellationToken ct)
    {
        var window = request.Window();
        async Task<List<TopSellingRow>> Top(string kind)
        {
            var ids = DatedEvents(request, window).Where(e => e.OrderKind == kind).Select(e => e.Id);
            return await db.OrderFinancialLines.Where(l => ids.Contains(l.EventId)).GroupBy(l => l.ProductKey)
                .Select(g => new { Key = g.Key, Name = g.Max(l => l.ProductName) ?? g.Key,
                    Quantity = g.Sum(l => l.Event!.Kind == "Receipt" ? l.Quantity : 0), RefundedQuantity = g.Sum(l => l.Event!.Kind == "Refund" ? l.Quantity : 0),
                    Orders = g.Where(l => l.Event!.Kind == "Receipt").Select(l => l.Event!.OrderId).Distinct().Count(),
                    Revenue = g.Sum(l => l.Event!.Kind == "Receipt" ? l.Amount : -l.Amount) })
                .OrderByDescending(row => row.Revenue).ThenBy(row => row.Key).Take(10)
                .Select(row => new TopSellingRow(row.Key, row.Name, row.Quantity, row.RefundedQuantity, row.Orders, row.Revenue)).ToListAsync(ct);
        }
        return new(await Top("Product"), await Top("DigitalCard"), DateTime.UtcNow);
    }

    private IQueryable<Order> Pending() => db.Orders.AsNoTracking().Where(o => !o.IsArchived && o.OrderStatus != OrderStatus.Delivered &&
        o.OrderStatus != OrderStatus.Cancelled && o.OrderStatus != OrderStatus.Shipped);
    private IQueryable<Order> RefundPending() => db.Orders.AsNoTracking().Where(o => o.OrderStatus == OrderStatus.Cancelled && o.PaymentStatus == PaymentStatus.Paid);
    private IQueryable<Product> LowStock() => db.Products.AsNoTracking().Where(p => p.ProductType == ProductType.InStock && p.Stock <= p.LowStockThreshold);

    public async Task<SystemReport> System(ReportRequest request, CancellationToken ct)
    {
        var window = request.Window();
        var customers = db.Users.AsNoTracking().Where(u => u.IsActive && u.Role == UserRole.Customer);
        var tags = await db.NfcTags.GroupBy(t => t.Status).Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(ct);
        var threshold = Math.Max(0, configuration.GetValue("Reporting:NfcLowStockThreshold", 10));
        return new(await customers.CountAsync(ct), await customers.CountAsync(u => u.CreatedAt >= window.Start && u.CreatedAt < window.End, ct),
            await db.Products.CountAsync(ct), await db.Products.Where(p => p.ProductType == ProductType.InStock).SumAsync(p => p.Stock, ct),
            await LowStock().CountAsync(ct), tags.Sum(t => t.Count), tags.Where(t => t.Status == NfcStatus.Available).Sum(t => t.Count),
            tags.Where(t => t.Status == NfcStatus.Reserved).Sum(t => t.Count), tags.Where(t => t.Status == NfcStatus.Sold).Sum(t => t.Count),
            tags.Where(t => t.Status == NfcStatus.Active).Sum(t => t.Count), await Pending().CountAsync(ct), await RefundPending().CountAsync(ct), threshold, DateTime.UtcNow);
    }

    public async Task<ReportDetails> Details(ReportRequest request, string metric, int page, CancellationToken ct)
    {
        var window = request.Window();
        if (page < 1 || page > 1000000) throw new ReportError(400, "Trang không hợp lệ.");
        IQueryable<ReportDetailRow> rows;
        if (metric is "orders" or "pending" or "refundPending")
        {
            var orders = metric == "pending" ? Pending() : metric == "refundPending" ? RefundPending() :
                Orders(request).Where(o => o.CreatedAt >= window.Start && o.CreatedAt < window.End);
            rows = orders.Select(o => new ReportDetailRow { Id = o.Id.ToString(), Label = o.OrderCode, Kind = o.OrderKind, At = o.CreatedAt,
                Amount = o.TotalAmount, Quantity = 1, Status = o.PaymentStatus.ToString(), Href = "/admin/orders/" + o.Id });
        }
        else if (metric is "customers" or "newCustomers")
        {
            var users = db.Users.AsNoTracking().Where(u => u.IsActive && u.Role == UserRole.Customer &&
                (metric == "customers" || (u.CreatedAt >= window.Start && u.CreatedAt < window.End)));
            rows = users.Select(u => new ReportDetailRow { Id = u.Id.ToString(), Label = u.FullName ?? u.DisplayName ?? "Khách hàng", Kind = "Customer", At = u.CreatedAt, Quantity = 1, Status = "Active" });
        }
        else if (metric is "products" or "lowStock")
        {
            var products = metric == "lowStock" ? LowStock() : db.Products.AsNoTracking();
            rows = products.Select(p => new ReportDetailRow { Id = p.Id.ToString(), Label = p.Name, Kind = "Product", At = p.CreatedAt, Amount = p.Price, Quantity = p.Stock,
                Status = p.ProductType.ToString(), Href = "/admin/products", Threshold = p.LowStockThreshold });
        }
        else if (metric == "nfc") rows = db.NfcTags.AsNoTracking().Select(t => new ReportDetailRow { Id = t.Id.ToString(), Label = t.TagCode,
            Kind = "NFC", At = t.CreatedAt, Quantity = 1, Status = t.Status.ToString(), Href = "/admin/nfc" });
        else if (metric == "buyers") rows = DatedEvents(request, window).Where(e => e.Kind == "Receipt").GroupBy(e => e.UserId)
            .Select(g => new ReportDetailRow { Id = g.Key.ToString(), Label = g.Key.ToString(), Kind = "Customer", At = g.Max(e => e.OccurredAt),
                Amount = g.Sum(e => e.MerchandiseAmount), Quantity = g.Count(), Status = "Paid" });
        else if (metric is "productsSold" or "cardsSold")
        {
            var kind = metric == "productsSold" ? "Product" : "DigitalCard";
            var ids = DatedEvents(request, window).Where(e => e.Kind == "Receipt" && e.OrderKind == kind).Select(e => e.Id);
            rows = db.OrderFinancialLines.Where(l => ids.Contains(l.EventId)).Select(l => new ReportDetailRow { Id = l.Id.ToString(),
                Label = l.ProductName, Kind = l.Event!.OrderKind, At = l.Event.OccurredAt, Amount = l.Amount, Quantity = l.Quantity, Status = "Receipt", Href = "/admin/orders/" + l.Event.OrderId });
        }
        else if (metric is "revenue" or "paidOrders" or "legacy")
        {
            var events = metric == "legacy" ? Events(request).Where(e => e.OccurredAt == null) : DatedEvents(request, window);
            if (metric == "paidOrders") events = events.Where(e => e.Kind == "Receipt");
            rows = events.Select(e => new ReportDetailRow { Id = e.Id.ToString(), Label = e.OrderCode, Kind = e.OrderKind, At = e.OccurredAt,
                Amount = e.Kind == "Receipt" ? e.MerchandiseAmount : -e.MerchandiseAmount, Quantity = 1, Status = e.Kind, Href = "/admin/orders/" + e.OrderId });
        }
        else throw new ReportError(400, "Chỉ số không hợp lệ.");
        var total = await rows.CountAsync(ct);
        return new(await rows.OrderByDescending(r => r.At).ThenBy(r => r.Id).Skip((page - 1) * 20).Take(20).ToListAsync(ct), total, page);
    }

    public async Task SetThreshold(Guid productId, int threshold, CancellationToken ct)
    {
        if (threshold is < 0 or > 1000000) throw new ReportError(400, "Ngưỡng tồn kho phải từ 0 đến 1.000.000.");
        var changed = await db.Products.Where(p => p.Id == productId).ExecuteUpdateAsync(s => s.SetProperty(p => p.LowStockThreshold, threshold), ct);
        if (changed == 0) throw new ReportError(404, "Không tìm thấy sản phẩm đang bán.");
    }

    public async IAsyncEnumerable<SalesExportRow> Export(ReportRequest request, [EnumeratorCancellation] CancellationToken ct)
    {
        var events = DatedEvents(request, request.Window()).OrderBy(e => e.OccurredAt).ThenBy(e => e.Id);
        await foreach (var row in events.Select(e => new SalesExportRow(e.Id, e.OrderCode, e.OrderKind, e.PaymentMethod,
            e.OccurredAt, e.Kind, e.Kind == "Receipt" ? e.MerchandiseAmount : -e.MerchandiseAmount,
            e.Kind == "Receipt" ? e.ShippingAmount : -e.ShippingAmount)).AsAsyncEnumerable().WithCancellation(ct)) yield return row;
    }
}
