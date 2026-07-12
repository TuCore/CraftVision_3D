using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Product;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _context.Set<Product>()
            .Include(p => p.ProductCategory)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product?> GetBySkuAsync(string sku)
    {
        return await _context.Set<Product>()
            .Include(p => p.ProductCategory)
            .FirstOrDefaultAsync(p => p.SKU == sku);
    }

    public async Task<(IEnumerable<Product> Items, int TotalCount)> SearchAndFilterAsync(ProductFilterDto filter)
    {
        var query = _context.Set<Product>().Include(p => p.ProductCategory).AsQueryable();
        
        query = query.Where(p => p.IsActive);

        if (!string.IsNullOrEmpty(filter.Keyword))
        {
            query = query.Where(p => p.Name.Contains(filter.Keyword) || (p.Description != null && p.Description.Contains(filter.Keyword)));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(p => p.ProductCategoryId == filter.CategoryId.Value);
        }

        if (!string.IsNullOrEmpty(filter.Type) && Enum.TryParse<CraftVision.Domain.Enums.ProductType>(filter.Type, true, out var pType))
        {
            query = query.Where(p => p.ProductType == pType);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);
        }

        var totalCount = await query.CountAsync();
        var items = await query.Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public void Add(Product product)
    {
        _context.Set<Product>().Add(product);
    }

    public void Update(Product product)
    {
        _context.Set<Product>().Update(product);
    }

    public void SoftDelete(Product product)
    {
        product.IsActive = false;
        _context.Set<Product>().Update(product);
    }
}
