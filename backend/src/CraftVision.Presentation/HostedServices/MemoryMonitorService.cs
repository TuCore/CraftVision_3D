using System.Diagnostics;

namespace CraftVision.Presentation.HostedServices;

public class MemoryMonitorService : BackgroundService
{
    private readonly ILogger<MemoryMonitorService> _logger;

    public MemoryMonitorService(ILogger<MemoryMonitorService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var process = Process.GetCurrentProcess();
            var usedMemoryMB = process.WorkingSet64 / (1024 * 1024);
            
            _logger.LogInformation("[Monitor] RAM đang sử dụng: {Memory} MB", usedMemoryMB);

            // Nghỉ 1 phút (60 giây) rồi mới in tiếp
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
