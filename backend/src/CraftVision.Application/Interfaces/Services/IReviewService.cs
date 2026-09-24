using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Review;

namespace CraftVision.Application.Interfaces.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto);
    Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(Guid productId);
    Task DeleteReviewAsync(Guid reviewId, Guid userId);
}
