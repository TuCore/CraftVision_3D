using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdWithItemsAsync(Guid id)
    {
        return await _context.Set<Order>()
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Gift)
                    .ThenInclude(g => g.NfcTag)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order?> GetByOrderCodeAsync(string orderCode)
    {
        return await _context.Set<Order>()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode);
    }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int size)
    {
        var query = _context.Set<Order>().Where(o => o.UserId == userId);
        int total = await query.CountAsync();
        var items = await query.OrderByDescending(o => o.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync();
        return (items, total);
    }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetAllAsync(int page, int size)
    {
        var query = _context.Set<Order>();
        int total = await query.CountAsync();
        var items = await query.OrderByDescending(o => o.CreatedAt).Skip((page - 1) * size).Take(size).ToListAsync();
        return (items, total);
    }

    public void Add(Order order)
    {
        _context.Set<Order>().Add(order);
    }

    public void Update(Order order)
    {
        _context.Set<Order>().Update(order);
    }
}
