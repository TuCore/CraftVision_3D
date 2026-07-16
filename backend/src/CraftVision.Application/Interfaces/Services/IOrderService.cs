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
    Task UpdateOrderStatusAsync(Guid orderId, string status);
    Task CompleteUserOrderAsync(Guid userId, Guid orderId);
}
