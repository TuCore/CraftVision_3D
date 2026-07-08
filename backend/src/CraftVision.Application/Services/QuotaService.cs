using System;
using System.Threading;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CraftVision.Application.Services;

public class QuotaService : IQuotaService
{
    private readonly ILogger<QuotaService> _logger;

    public QuotaService(ILogger<QuotaService> logger)
    {
        _logger = logger;
    }

    public Task DeductCreditAsync(Guid userId, int amount, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Mock deducting {amount} credits from user {userId}");
        return Task.CompletedTask;
    }

    public Task RefundCreditAsync(Guid userId, int amount, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation($"Mock refunding {amount} credits to user {userId}");
        return Task.CompletedTask;
    }
}
