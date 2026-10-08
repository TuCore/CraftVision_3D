using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Common;
using CraftVision.Application.DTOs.Order;

namespace CraftVision.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto dto);
    Task<OrderDto> GetOrderByIdAsync(Guid id);
    Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int page, int size);
    Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int size);
    Task<bool> CheckAndUpdatePaymentStatusAsync(Guid orderId);
    Task UpdateOrderStatusAsync(Guid orderId, string status);
    Task UpdatePaymentStatusAsync(Guid orderId, string status);
    Task SimulatePaymentAsync(Guid orderId);
    Task CompleteUserOrderAsync(Guid userId, Guid orderId);
    Task CancelUserOrderAsync(Guid userId, Guid orderId);
    Task DeleteOrderAsync(Guid id);
}
