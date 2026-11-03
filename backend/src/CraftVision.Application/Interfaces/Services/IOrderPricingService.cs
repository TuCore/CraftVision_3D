using CraftVision.Application.DTOs.Order;
using CraftVision.Application.DTOs.Vouchers;

namespace CraftVision.Application.Interfaces.Services;

public interface IOrderPricingService
{
    Task<CheckoutQuote> PriceAsync(CreateOrderDto request, CancellationToken ct = default);
}
