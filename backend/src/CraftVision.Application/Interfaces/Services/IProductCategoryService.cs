using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.ProductCategory;

namespace CraftVision.Application.Interfaces;

public interface IProductCategoryService
{
    Task<ProductCategoryDto> GetByIdAsync(Guid id);
    Task<IEnumerable<ProductCategoryDto>> GetAllActiveAsync();
    Task<ProductCategoryDto> GetBySlugAsync(string slug);
    Task<ProductCategoryDto> CreateAsync(CreateProductCategoryDto dto);
    Task<ProductCategoryDto> UpdateAsync(Guid id, CreateProductCategoryDto dto);
    Task DeleteAsync(Guid id);
}
