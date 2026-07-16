using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.AI.Tripo;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Workers;

public class Tripo3DTaskProcessorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<Tripo3DTaskProcessorService> _logger;
    private readonly string _workerId;

    public Tripo3DTaskProcessorService(IServiceProvider serviceProvider, ILogger<Tripo3DTaskProcessorService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _workerId = Guid.NewGuid().ToString("N");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation($"Tripo3DTaskProcessorService started with WorkerId: {_workerId}");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingTasksAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing Tripo3D tasks.");
            }

            // Polling interval
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }

    private async Task ProcessPendingTasksAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var tripoClient = scope.ServiceProvider.GetRequiredService<ITripoClient>();
        var quotaService = scope.ServiceProvider.GetRequiredService<IQuotaService>();

        var lockTime = DateTime.UtcNow.AddMinutes(2); // Lock for 2 minutes
        var now = DateTime.UtcNow;

        // 1. Claim pending tasks using ExecuteUpdateAsync
        var rowsAffected = await dbContext.Ai3dRequests
            .Where(x => (x.Status == "queued" || x.Status == "running")
                     && (x.LockedUntil == null || x.LockedUntil < now))
            .OrderBy(x => x.CreatedAt)
            .Take(10)
            .ExecuteUpdateAsync(s => s
                .SetProperty(p => p.LockedBy, _workerId)
                .SetProperty(p => p.LockedUntil, lockTime), ct);

        if (rowsAffected == 0) return;

        // 2. Fetch the locked tasks
        var tasksToProcess = await dbContext.Ai3dRequests
            .Where(x => x.LockedBy == _workerId && x.LockedUntil == lockTime)
            .ToListAsync(ct);

        foreach (var task in tasksToProcess)
        {
            try
            {
                if (string.IsNullOrEmpty(task.TripoTaskId))
                {
                    // If no TaskId, it failed during creation in a weird state
                    task.Status = "failed";
                    task.ErrorMessage = "Missing TripoTaskId";
                    task.LockedUntil = null;
                    await quotaService.RefundCreditAsync(task.UserId, task.CreditCost, ct);
                    continue;
                }

                // 3. Call HTTP GET
                var tripoResult = await tripoClient.GetTaskStatusAsync(task.TripoTaskId, ct);

                if (tripoResult == null || tripoResult.Data == null)
                {
                    _logger.LogWarning($"Tripo API returned null data for TaskId {task.TripoTaskId}");
                    continue;
                }

                task.Status = tripoResult.Data.Status;
                task.Progress = tripoResult.Data.Progress;
                task.UpdatedAt = DateTime.UtcNow;

                if (task.Status == "success")
                {
                    task.ResultModelUrl = tripoResult.Data.Result?.ModelUrl;
                    task.LockedUntil = null; // Unlock
                }
                else if (new[] { "failed", "cancelled", "banned", "expired" }.Contains(task.Status))
                {
                    task.ErrorMessage = tripoResult.Data.ErrorMsg ?? "Task failed on Tripo side.";
                    task.LockedUntil = null;
                    
                    // Refund user
                    await quotaService.RefundCreditAsync(task.UserId, task.CreditCost, ct);
                }
                else
                {
                    // Task still running -> Calc ETA and extend lock
                    var leftTimeSec = tripoResult.Data.RunningLeftTime ?? 30;
                    task.LockedUntil = DateTime.UtcNow.AddSeconds(Math.Max(leftTimeSec, 30));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing task {task.Id} (TripoTaskId: {task.TripoTaskId})");
                task.LockedUntil = null; // Release lock so it can be retried
            }
        }

        await dbContext.SaveChangesAsync(ct);
    }
}
