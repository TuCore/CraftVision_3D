using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class GiftCategoryRepository : IGiftCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public GiftCategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GiftCategory?> GetByIdAsync(Guid id)
    {
        return await _context.Set<GiftCategory>().FindAsync(id);
    }

    public async Task<IEnumerable<GiftCategory>> GetAllActiveAsync()
    {
        return await _context.Set<GiftCategory>().Where(x => x.IsActive).ToListAsync();
    }

    public async Task<GiftCategory?> GetBySlugAsync(string slug)
    {
        return await _context.Set<GiftCategory>().FirstOrDefaultAsync(x => x.Slug == slug);
    }

    public void Add(GiftCategory category)
    {
        _context.Set<GiftCategory>().Add(category);
    }

    public void Update(GiftCategory category)
    {
        _context.Set<GiftCategory>().Update(category);
    }

    public void SoftDelete(GiftCategory category)
    {
        category.IsActive = false;
        _context.Set<GiftCategory>().Update(category);
    }
}
