using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.ProductCategory;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Services;

public class ProductCategoryService : IProductCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductCategoryDto> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.ProductCategories.GetByIdAsync(id);
        if (entity == null || !entity.IsActive) throw new Exception("Product Category not found");
        return new ProductCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetAllActiveAsync()
    {
        var entities = await _unitOfWork.ProductCategories.GetAllActiveAsync();
        return entities.Select(e => new ProductCategoryDto { Id = e.Id, Name = e.Name, Slug = e.Slug, Description = e.Description, Icon = e.Icon, DisplayOrder = e.DisplayOrder });
    }

    public async Task<ProductCategoryDto> GetBySlugAsync(string slug)
    {
        var entity = await _unitOfWork.ProductCategories.GetBySlugAsync(slug);
        if (entity == null || !entity.IsActive) throw new Exception("Product Category not found");
        return new ProductCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<ProductCategoryDto> CreateAsync(CreateProductCategoryDto dto)
    {
        var entity = new ProductCategory { Name = dto.Name, Slug = dto.Slug, Description = dto.Description, Icon = dto.Icon, DisplayOrder = dto.DisplayOrder };
        _unitOfWork.ProductCategories.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return new ProductCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<ProductCategoryDto> UpdateAsync(Guid id, CreateProductCategoryDto dto)
    {
        var entity = await _unitOfWork.ProductCategories.GetByIdAsync(id);
        if (entity == null || !entity.IsActive) throw new Exception("Product Category not found");
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.Icon = dto.Icon;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.ProductCategories.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return new ProductCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, DisplayOrder = entity.DisplayOrder };
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.ProductCategories.GetByIdAsync(id);
        if (entity == null) throw new Exception("Product Category not found");
        _unitOfWork.ProductCategories.SoftDelete(entity);
        await _unitOfWork.SaveChangesAsync();
    }
}
