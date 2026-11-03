using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CraftVision.Vouchers;

public sealed class VoucherReservationWorker(IServiceScopeFactory scopes, ILogger<VoucherReservationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var ids = await db.VoucherUsages.Where(u => u.Status == "Reserved" && u.ExpiresAt < DateTime.UtcNow &&
                    u.Order!.PaymentStatus == Domain.Enums.PaymentStatus.Unpaid).Select(u => u.OrderId).Take(20).ToListAsync(stoppingToken);
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                foreach (var id in ids)
                {
                    try { await orders.CheckAndUpdatePaymentStatusAsync(id); }
                    catch (Exception ex) { logger.LogWarning(ex, "Could not reconcile voucher order {OrderId}", id); }
                }
                await scope.ServiceProvider.GetRequiredService<IWebVoucherService>().ExpireAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { logger.LogError(ex, "Voucher reservation reconciliation failed; capacity remains reserved."); }
        }
    }
}
