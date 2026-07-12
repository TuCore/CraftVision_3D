using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IProductImageRepository
{
    Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId);
    void Add(ProductImage image);
    void AddRange(IEnumerable<ProductImage> images);
    void Delete(ProductImage image);
}
