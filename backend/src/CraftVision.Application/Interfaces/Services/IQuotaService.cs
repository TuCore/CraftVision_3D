using System;
using System.Threading;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces;

public interface IQuotaService
{
    Task DeductCreditAsync(Guid userId, int amount, CancellationToken cancellationToken = default);
    Task RefundCreditAsync(Guid userId, int amount, CancellationToken cancellationToken = default);
}
