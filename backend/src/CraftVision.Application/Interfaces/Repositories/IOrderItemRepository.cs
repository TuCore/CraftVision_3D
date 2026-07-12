using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IOrderItemRepository
{
    Task<IEnumerable<OrderItem>> GetByOrderIdAsync(Guid orderId);
    void Add(OrderItem item);
    void AddRange(IEnumerable<OrderItem> items);
}
