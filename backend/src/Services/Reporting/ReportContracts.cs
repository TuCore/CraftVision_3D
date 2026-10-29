using System.Globalization;

namespace CraftVision.Reporting;

public sealed class ReportError(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed class ReportRequest
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public string Kind { get; set; } = "all";
    public string Method { get; set; } = "all";
    public string GroupBy { get; set; } = "day";

    public ReportWindow Window()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
        if (From.Year < 2000 || To < From || To > today || To.DayNumber - From.DayNumber >= 366)
            throw new ReportError(400, "Chọn khoảng ngày hợp lệ, tối đa 366 ngày và không vượt quá hôm nay.");
        if (Kind is not ("all" or "Product" or "DigitalCard") || Method is not ("all" or "Cod" or "BankTransfer" or "None") ||
            GroupBy is not ("day" or "week" or "month")) throw new ReportError(400, "Bộ lọc báo cáo không hợp lệ.");
        var start = DateTime.SpecifyKind(From.ToDateTime(TimeOnly.MinValue).AddHours(-7), DateTimeKind.Utc);
        return new(start, start.AddDays(To.DayNumber - From.DayNumber + 1));
    }
}

public sealed record ReportWindow(DateTime Start, DateTime End)
{
    public ReportWindow Previous => new(Start - (End - Start), Start);
}
public sealed record ReportMetrics(decimal Revenue = 0, int Orders = 0, int PaidOrders = 0,
    int ProductsSold = 0, int CardsSold = 0, int Buyers = 0, decimal Receipts = 0, decimal Refunds = 0,
    decimal Shipping = 0, int RefundedProducts = 0, int RefundedCards = 0);
public sealed record SummaryReport(ReportMetrics Current, ReportMetrics Previous, int UnknownEvents,
    decimal UnknownNetRevenue, DateTime UpdatedAt);
public sealed record RevenueDay(DateTime Day, decimal Receipts, decimal Refunds, decimal ProductRevenue, decimal CardRevenue);
public sealed record RevenuePoint(string Date, decimal Revenue, decimal Receipts, decimal Refunds, decimal PreviousRevenue);
public sealed record ReportSlice(string Name, decimal Value);
public sealed record RevenueReport(IReadOnlyList<RevenuePoint> Series, IReadOnlyList<ReportSlice> Composition,
    IReadOnlyList<ReportSlice> Statuses, DateTime UpdatedAt);
public sealed record TopSellingRow(string Key, string Name, int Quantity, int RefundedQuantity, int Orders, decimal Revenue);
public sealed record TopSellingReport(IReadOnlyList<TopSellingRow> Products, IReadOnlyList<TopSellingRow> Cards, DateTime UpdatedAt);
public sealed record ReportDetailRow
{
    public string Id { get; init; } = "";
    public string Label { get; init; } = "";
    public string Kind { get; init; } = "";
    public DateTime? At { get; init; }
    public decimal Amount { get; init; }
    public int Quantity { get; init; }
    public string Status { get; init; } = "";
    public string? Href { get; init; }
    public int? Threshold { get; init; }
}
public sealed record ReportDetails(IReadOnlyList<ReportDetailRow> Items, int TotalItems, int Page, int PageSize = 20);
public sealed record SystemReport(int Customers, int NewCustomers, int Products, int Stock, int LowStock,
    int NfcTotal, int NfcAvailable, int NfcReserved, int NfcSold, int NfcActive, int PendingOrders,
    int RefundPending, int NfcLowStockThreshold, DateTime UpdatedAt);
public sealed record SalesExportRow(Guid Id, string OrderCode, string OrderKind, string Method,
    DateTime? At, string Kind, decimal Merchandise, decimal Shipping);

public interface ICommerceReports
{
    Task<SummaryReport> Summary(ReportRequest request, CancellationToken ct);
    Task<RevenueReport> Revenue(ReportRequest request, CancellationToken ct);
    Task<TopSellingReport> TopSelling(ReportRequest request, CancellationToken ct);
    Task<SystemReport> System(ReportRequest request, CancellationToken ct);
    Task<ReportDetails> Details(ReportRequest request, string metric, int page, CancellationToken ct);
    Task SetThreshold(Guid productId, int threshold, CancellationToken ct);
    IAsyncEnumerable<SalesExportRow> Export(ReportRequest request, CancellationToken ct);
}

public static class ReportSeries
{
    private static DateTime Bucket(DateTime day, string group) => group switch
    {
        "week" => day.Date.AddDays(-((int)day.DayOfWeek + 6) % 7),
        "month" => new(day.Year, day.Month, 1),
        _ => day.Date,
    };

    // The database returns at most one row per local day; only zero-filling and bucket alignment happen in memory.
    public static IReadOnlyList<RevenuePoint> Build(ReportWindow window, string group,
        IReadOnlyList<RevenueDay> current, IReadOnlyList<RevenueDay> previous)
    {
        var result = new List<RevenuePoint>();
        var localStart = window.Start.AddHours(7).Date;
        var days = (int)(window.End - window.Start).TotalDays;
        var rows = Enumerable.Range(0, days).Select(index =>
        {
            var day = localStart.AddDays(index);
            var row = current.SingleOrDefault(r => r.Day.Date == day);
            var prior = previous.SingleOrDefault(r => r.Day.Date == day.AddDays(-days));
            return new { Day = day, Receipts = row?.Receipts ?? 0, Refunds = row?.Refunds ?? 0,
                Previous = (prior?.Receipts ?? 0) - (prior?.Refunds ?? 0) };
        });
        foreach (var bucket in rows.GroupBy(row => Bucket(row.Day, group)))
            result.Add(new(bucket.Key.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                bucket.Sum(row => row.Receipts - row.Refunds), bucket.Sum(row => row.Receipts),
                bucket.Sum(row => row.Refunds), bucket.Sum(row => row.Previous)));
        return result;
    }

    public static string CsvCell(string value)
    {
        // Excel formula injection is possible even when cells are quoted.
        if (value.TrimStart().StartsWith('=') || value.TrimStart().StartsWith('+') ||
            value.TrimStart().StartsWith('-') || value.TrimStart().StartsWith('@') || value.StartsWith('\t') || value.StartsWith('\r')) value = "'" + value;
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }
}
