using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class OrderItemRepository : IOrderItemRepository
{
    private readonly ApplicationDbContext _context;

    public OrderItemRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderItem>> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.Set<OrderItem>().Where(oi => oi.OrderId == orderId).ToListAsync();
    }

    public void Add(OrderItem item)
    {
        _context.Set<OrderItem>().Add(item);
    }

    public void AddRange(IEnumerable<OrderItem> items)
    {
        _context.Set<OrderItem>().AddRange(items);
    }
}
