using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.GiftCategory;

namespace CraftVision.Application.Interfaces;

public interface IGiftCategoryService
{
    Task<GiftCategoryDto> GetByIdAsync(Guid id);
    Task<IEnumerable<GiftCategoryDto>> GetAllActiveAsync();
    Task<GiftCategoryDto> GetBySlugAsync(string slug);
    Task<GiftCategoryDto> CreateAsync(CreateGiftCategoryDto dto);
    Task<GiftCategoryDto> UpdateAsync(Guid id, CreateGiftCategoryDto dto);
    Task DeleteAsync(Guid id);
}
