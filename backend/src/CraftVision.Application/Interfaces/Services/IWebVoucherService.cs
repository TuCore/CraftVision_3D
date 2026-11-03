using CraftVision.Application.DTOs.Order;
using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Services;

public interface IWebVoucherService
{
    Task<IReadOnlyList<VoucherView>> ListAsync(CancellationToken ct = default);
    Task<VoucherView> CreateAsync(Guid admin, VoucherSettings settings, CancellationToken ct = default);
    Task<VoucherView> UpdateAsync(Guid id, VoucherSettings settings, CancellationToken ct = default);
    Task<VoucherUsagePage> UsagesAsync(Guid id, int page, CancellationToken ct = default);
    Task<CheckoutQuote> QuoteAsync(Guid user, CreateOrderDto request, CancellationToken ct = default);
    Task ReserveAsync(Order order, string code, CancellationToken ct = default);
    Task SynchronizeAsync(Order order, CancellationToken ct = default);
    Task EnsurePayableAsync(Order order, CancellationToken ct = default);
    Task ExpireAsync(CancellationToken ct = default);
}
