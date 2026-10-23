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
        var dto = MapToDto(p);
        dto.OriginalStock = p.Stock;
        dto.ReservedStock = 0;
        dto.Stock = p.Stock;
        dto.AvailableStock = p.Stock;
        return dto;
    }

    public async Task<ProductDto> GetBySkuAsync(string sku)
    {
        var p = await _unitOfWork.Products.GetBySkuAsync(sku);
        if (p == null || !p.IsActive) throw new Exception("Product not found");
        var dto = MapToDto(p);
        dto.OriginalStock = p.Stock;
        dto.ReservedStock = 0;
        dto.Stock = p.Stock;
        dto.AvailableStock = p.Stock;
        return dto;
    }

    public async Task<PagedResult<ProductDto>> GetAllAsync(ProductFilterDto filter)
    {
        var (items, total) = await _unitOfWork.Products.SearchAndFilterAsync(filter);
        var pList = items.ToList();

        return new PagedResult<ProductDto>
        {
            Items = pList.Select(p =>
            {
                var dto = MapToDto(p);
                dto.OriginalStock = p.Stock;
                dto.ReservedStock = 0;
                dto.Stock = p.Stock;
                dto.AvailableStock = p.Stock;
                return dto;
            }).ToList(),
            TotalItems = total,
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
            IsComingSoon = dto.IsComingSoon,
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
        product.IsComingSoon = dto.IsComingSoon;
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

    public async Task<List<ProductStockStatusDto>> CheckStockAsync(CheckStockRequestDto dto)
    {
        var result = new List<ProductStockStatusDto>();
        if (dto?.Items == null || !dto.Items.Any())
        {
            return result;
        }

        foreach (var item in dto.Items)
        {
            if (item.ProductId == Guid.Empty)
            {
                result.Add(new ProductStockStatusDto
                {
                    ProductId = item.ProductId,
                    Name = "Mẫu thiệp số",
                    Stock = 9999,
                    ProductType = "Digital",
                    IsActive = true,
                    IsOutOfStock = false,
                    IsSufficient = true,
                    RequestedQuantity = item.Quantity,
                    Message = null
                });
                continue;
            }

            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product == null || !product.IsActive)
            {
                result.Add(new ProductStockStatusDto
                {
                    ProductId = item.ProductId,
                    Name = product?.Name ?? "Sản phẩm không tồn tại",
                    Stock = 0,
                    ProductType = product?.ProductType.ToString() ?? "Unknown",
                    IsActive = false,
                    IsOutOfStock = true,
                    IsSufficient = false,
                    RequestedQuantity = item.Quantity,
                    Message = "Sản phẩm không còn khả dụng hoặc đã ngừng kinh doanh."
                });
                continue;
            }

            int availableStock = Math.Max(0, product.Stock);
            bool isOutOfStock = product.ProductType == ProductType.InStock && availableStock < item.Quantity;
            bool isSufficient = product.ProductType != ProductType.InStock || availableStock >= item.Quantity;
            string? message = null;
            if (availableStock <= 0 && isOutOfStock)
            {
                message = "Sản phẩm đã hết hàng.";
            }
            else if (!isSufficient)
            {
                message = $"Chỉ còn {availableStock} sản phẩm khả dụng trong kho.";
            }

            result.Add(new ProductStockStatusDto
            {
                ProductId = product.Id,
                Name = product.Name,
                Price = product.Price,
                Stock = availableStock,
                ProductType = product.ProductType.ToString(),
                IsActive = product.IsActive,
                IsOutOfStock = isOutOfStock,
                IsSufficient = isSufficient,
                RequestedQuantity = item.Quantity,
                Message = message
            });
        }

        return result;
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
            AvailableStock = p.Stock,
            ReservedStock = 0,
            SampleImageUrl = p.SampleImageUrl,
            ProductType = p.ProductType.ToString(),
            SupportsNfc = p.SupportsNfc,
            EstimatedProductionDays = p.EstimatedProductionDays,
            CategoryName = p.ProductCategory?.Name,
            IsComingSoon = p.IsComingSoon,
            ThumbnailUrl = p.ProductImages?.OrderBy(pi => pi.DisplayOrder).FirstOrDefault(pi => pi.IsThumbnail)?.File?.FileUrl,
            Images = p.ProductImages?.OrderBy(pi => pi.DisplayOrder).Select(pi => pi.File?.FileUrl ?? "").Where(url => !string.IsNullOrEmpty(url)).ToList() ?? new List<string>()
        };
    }
}
