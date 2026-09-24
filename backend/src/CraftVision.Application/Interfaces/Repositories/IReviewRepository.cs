using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(Guid id);
    Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId);
    Task<IEnumerable<Review>> GetByUserIdAsync(Guid userId);
    void Add(Review review);
    void Update(Review review);
    void Remove(Review review);
}
