using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;
using CraftVision.Application.DTOs.Product;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<Product?> GetBySkuAsync(string sku);
    Task<(IEnumerable<Product> Items, int TotalCount)> SearchAndFilterAsync(ProductFilterDto filter);
    Task<int> GetQuantityInCartsAsync(Guid productId);
    Task<Dictionary<Guid, int>> GetQuantitiesInCartsAsync(IEnumerable<Guid> productIds);
    void Add(Product product);
    void Update(Product product);
    void SoftDelete(Product product);
}
