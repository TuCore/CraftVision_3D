using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IGiftCategoryRepository
{
    Task<GiftCategory?> GetByIdAsync(Guid id);
    Task<IEnumerable<GiftCategory>> GetAllActiveAsync();
    Task<GiftCategory?> GetBySlugAsync(string slug);
    void Add(GiftCategory category);
    void Update(GiftCategory category);
    void SoftDelete(GiftCategory category);
}
