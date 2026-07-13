using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class ProductCategoryRepository : IProductCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public ProductCategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductCategory?> GetByIdAsync(Guid id)
    {
        return await _context.Set<ProductCategory>().FindAsync(id);
    }

    public async Task<IEnumerable<ProductCategory>> GetAllActiveAsync()
    {
        return await _context.Set<ProductCategory>().Where(x => x.IsActive).ToListAsync();
    }

    public async Task<ProductCategory?> GetBySlugAsync(string slug)
    {
        return await _context.Set<ProductCategory>().FirstOrDefaultAsync(x => x.Slug == slug);
    }

    public void Add(ProductCategory category)
    {
        _context.Set<ProductCategory>().Add(category);
    }

    public void Update(ProductCategory category)
    {
        _context.Set<ProductCategory>().Update(category);
    }

    public void SoftDelete(ProductCategory category)
    {
        category.IsActive = false;
        _context.Set<ProductCategory>().Update(category);
    }
}
