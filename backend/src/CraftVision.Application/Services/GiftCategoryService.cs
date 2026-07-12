using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.GiftCategory;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Services;

public class GiftCategoryService : IGiftCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public GiftCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<GiftCategoryDto> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.GiftCategories.GetByIdAsync(id);
        if (entity == null || !entity.IsActive) throw new Exception("Gift Category not found");
        return new GiftCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, PromptTemplate = entity.PromptTemplate, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<IEnumerable<GiftCategoryDto>> GetAllActiveAsync()
    {
        var entities = await _unitOfWork.GiftCategories.GetAllActiveAsync();
        return entities.Select(e => new GiftCategoryDto { Id = e.Id, Name = e.Name, Slug = e.Slug, Description = e.Description, Icon = e.Icon, PromptTemplate = e.PromptTemplate, DisplayOrder = e.DisplayOrder });
    }

    public async Task<GiftCategoryDto> GetBySlugAsync(string slug)
    {
        var entity = await _unitOfWork.GiftCategories.GetBySlugAsync(slug);
        if (entity == null || !entity.IsActive) throw new Exception("Gift Category not found");
        return new GiftCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, PromptTemplate = entity.PromptTemplate, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<GiftCategoryDto> CreateAsync(CreateGiftCategoryDto dto)
    {
        var entity = new GiftCategory { Name = dto.Name, Slug = dto.Slug, Description = dto.Description, Icon = dto.Icon, PromptTemplate = dto.PromptTemplate, DisplayOrder = dto.DisplayOrder };
        _unitOfWork.GiftCategories.Add(entity);
        await _unitOfWork.SaveChangesAsync();
        return new GiftCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, PromptTemplate = entity.PromptTemplate, DisplayOrder = entity.DisplayOrder };
    }

    public async Task<GiftCategoryDto> UpdateAsync(Guid id, CreateGiftCategoryDto dto)
    {
        var entity = await _unitOfWork.GiftCategories.GetByIdAsync(id);
        if (entity == null || !entity.IsActive) throw new Exception("Gift Category not found");
        entity.Name = dto.Name;
        entity.Slug = dto.Slug;
        entity.Description = dto.Description;
        entity.Icon = dto.Icon;
        entity.PromptTemplate = dto.PromptTemplate;
        entity.DisplayOrder = dto.DisplayOrder;
        _unitOfWork.GiftCategories.Update(entity);
        await _unitOfWork.SaveChangesAsync();
        return new GiftCategoryDto { Id = entity.Id, Name = entity.Name, Slug = entity.Slug, Description = entity.Description, Icon = entity.Icon, PromptTemplate = entity.PromptTemplate, DisplayOrder = entity.DisplayOrder };
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.GiftCategories.GetByIdAsync(id);
        if (entity == null) throw new Exception("Gift Category not found");
        _unitOfWork.GiftCategories.SoftDelete(entity);
        await _unitOfWork.SaveChangesAsync();
    }
}
