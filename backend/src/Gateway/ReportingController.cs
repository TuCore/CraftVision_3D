using System.Globalization;
using System.Text;
using CraftVision.CardSharing;
using CraftVision.Reporting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CraftVision.Gateway;

public sealed record StockThresholdInput(int Threshold);

[ApiController, Authorize(Roles = "Admin"), Route("api/admin/dashboard")]
[ServiceFilter(typeof(ReportingErrorFilter))]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class ReportingController(ICommerceReports reports, IServiceProvider services) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] ReportRequest query, CancellationToken ct) => Ok(await reports.Summary(query, ct));
    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue([FromQuery] ReportRequest query, CancellationToken ct) => Ok(await reports.Revenue(query, ct));
    [HttpGet("top-selling")]
    public async Task<IActionResult> TopSelling([FromQuery] ReportRequest query, CancellationToken ct) => Ok(await reports.TopSelling(query, ct));
    [HttpGet("system")]
    public async Task<IActionResult> System([FromQuery] ReportRequest query, CancellationToken ct) => Ok(await reports.System(query, ct));
    [HttpGet("details")]
    public async Task<IActionResult> Details([FromQuery] ReportRequest query, [FromQuery] string metric, [FromQuery] int page = 1, CancellationToken ct = default) =>
        Ok(await reports.Details(query, metric, page, ct));
    [HttpPut("stock-threshold/{id:guid}")]
    public async Task<IActionResult> Threshold(Guid id, StockThresholdInput input, CancellationToken ct)
    {
        await reports.SetThreshold(id, input.Threshold, ct);
        return NoContent();
    }
    [HttpGet("cards")]
    public async Task<IActionResult> Cards([FromQuery] int page = 1, CancellationToken ct = default)
    {
        var cards = services.GetService<CardService>() ?? throw new ReportError(503, "Thống kê thiệp số tạm thời chưa khả dụng.");
        return Ok(await cards.Inventory(page, ct));
    }

    [HttpGet("/api/admin/reports/sales/export")]
    public async Task Export([FromQuery] ReportRequest query, CancellationToken ct)
    {
        query.Window();
        await using var rows = reports.Export(query, ct).GetAsyncEnumerator(ct);
        var more = await rows.MoveNextAsync();
        Response.ContentType = "text/csv; charset=utf-8";
        Response.Headers.ContentDisposition = $"attachment; filename=sales-{query.From:yyyy-MM-dd}-{query.To:yyyy-MM-dd}.csv";
        await Response.WriteAsync("\uFEFFMã giao dịch,Mã đơn,Loại đơn,Thanh toán,Thời gian Việt Nam,Loại giao dịch,Tiền hàng VND,Phí giao hàng VND\r\n", Encoding.UTF8, ct);
        while (more)
        {
            var row = rows.Current;
            var cells = new[] { row.Id.ToString(), row.OrderCode, row.OrderKind, row.Method,
                row.At?.AddHours(7).ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) ?? "", row.Kind };
            await Response.WriteAsync(string.Join(',', cells.Select(ReportSeries.CsvCell)) + "," +
                row.Merchandise.ToString(CultureInfo.InvariantCulture) + "," + row.Shipping.ToString(CultureInfo.InvariantCulture) + "\r\n", ct);
            more = await rows.MoveNextAsync();
        }
    }
}

public sealed class ReportingErrorFilter(ILogger<ReportingErrorFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.HttpContext.Response.HasStarted) return;
        var status = context.Exception switch { ReportError e => e.Status, CardError e => e.Status, _ => 503 };
        if (status == 503) logger.LogError(context.Exception, "Admin reporting source unavailable");
        var message = status == 503 ? "Không tải được báo cáo. Vui lòng thử lại sau." : context.Exception.Message;
        context.Result = new ObjectResult(new { message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
