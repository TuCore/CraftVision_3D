using System;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Common;
using CraftVision.Application.DTOs.Product;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;

namespace CraftVision.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductDto> GetByIdAsync(Guid id)
    {
        var p = await _unitOfWork.Products.GetByIdAsync(id);
        if (p == null || !p.IsActive) throw new Exception("Product not found");
        return MapToDto(p);
    }

    public async Task<ProductDto> GetBySkuAsync(string sku)
    {
        var p = await _unitOfWork.Products.GetBySkuAsync(sku);
        if (p == null || !p.IsActive) throw new Exception("Product not found");
        return MapToDto(p);
    }

    public async Task<PagedResult<ProductDto>> GetAllAsync(ProductFilterDto filter)
    {
        var (items, total) = await _unitOfWork.Products.SearchAndFilterAsync(filter);
        return new PagedResult<ProductDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            ProductCategoryId = dto.ProductCategoryId,
            Name = dto.Name,
            SKU = dto.SKU,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.ProductType == "PreOrder" ? 0 : dto.Stock,
            SampleImageUrl = dto.SampleImageUrl,
            ProductType = Enum.Parse<ProductType>(dto.ProductType),
            SupportsNfc = dto.SupportsNfc,
            EstimatedProductionDays = dto.EstimatedProductionDays,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _unitOfWork.Products.Add(product);
        
        if (dto.ProductImageFileIds != null && dto.ProductImageFileIds.Any())
        {
            int order = 1;
            foreach (var fileId in dto.ProductImageFileIds)
            {
                _unitOfWork.ProductImages.Add(new ProductImage
                {
                    ProductId = product.Id,
                    FileId = fileId,
                    DisplayOrder = order++,
                    IsThumbnail = order == 2 // first one is thumbnail
                });
            }
        }
        
        await _unitOfWork.SaveChangesAsync();
        return MapToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, CreateProductDto dto)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null || !product.IsActive) throw new Exception("Product not found");
        
        product.ProductCategoryId = dto.ProductCategoryId;
        product.Name = dto.Name;
        product.SKU = dto.SKU;
        product.Description = dto.Description;
        product.Price = dto.Price;
        if (product.ProductType == ProductType.InStock)
        {
            product.Stock = dto.Stock;
        }
        product.SampleImageUrl = dto.SampleImageUrl;
        product.SupportsNfc = dto.SupportsNfc;
        product.EstimatedProductionDays = dto.EstimatedProductionDays;
        product.UpdatedAt = DateTime.UtcNow;
        
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync();
        return MapToDto(product);
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) throw new Exception("Product not found");
        _unitOfWork.Products.SoftDelete(product);
        await _unitOfWork.SaveChangesAsync();
    }

    private ProductDto MapToDto(Product p)
    {
        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            SampleImageUrl = p.SampleImageUrl,
            ProductType = p.ProductType.ToString(),
            SupportsNfc = p.SupportsNfc,
            EstimatedProductionDays = p.EstimatedProductionDays,
            CategoryName = p.ProductCategory?.Name
        };
    }
}
