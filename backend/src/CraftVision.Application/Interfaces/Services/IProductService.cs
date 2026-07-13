using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Common;
using CraftVision.Application.DTOs.Product;

namespace CraftVision.Application.Interfaces;

public interface IProductService
{
    Task<ProductDto> GetByIdAsync(Guid id);
    Task<ProductDto> GetBySkuAsync(string sku);
    Task<PagedResult<ProductDto>> GetAllAsync(ProductFilterDto filter);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    Task<ProductDto> UpdateAsync(Guid id, CreateProductDto dto);
    Task DeleteAsync(Guid id);
}
