using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IProductCategoryRepository
{
    Task<ProductCategory?> GetByIdAsync(Guid id);
    Task<IEnumerable<ProductCategory>> GetAllActiveAsync();
    Task<ProductCategory?> GetBySlugAsync(string slug);
    void Add(ProductCategory category);
    void Update(ProductCategory category);
    void SoftDelete(ProductCategory category);
}
