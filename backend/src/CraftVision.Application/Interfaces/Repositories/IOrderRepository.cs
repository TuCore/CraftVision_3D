using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByIdWithItemsAsync(Guid id);
    Task<Order?> GetByOrderCodeAsync(string orderCode);
    Task<(IEnumerable<Order> Items, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int size);
    void Add(Order order);
    void Update(Order order);
}
