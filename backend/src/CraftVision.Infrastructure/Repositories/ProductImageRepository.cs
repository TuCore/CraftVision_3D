using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class ProductImageRepository : IProductImageRepository
{
    private readonly ApplicationDbContext _context;

    public ProductImageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId)
    {
        return await _context.Set<ProductImage>().Where(x => x.ProductId == productId).ToListAsync();
    }

    public void Add(ProductImage image)
    {
        _context.Set<ProductImage>().Add(image);
    }

    public void AddRange(IEnumerable<ProductImage> images)
    {
        _context.Set<ProductImage>().AddRange(images);
    }

    public void Delete(ProductImage image)
    {
        _context.Set<ProductImage>().Remove(image);
    }
}
