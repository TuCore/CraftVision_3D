using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Review;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewDto dto)
    {
        // 1. Verify user exists
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        // 2. Verify product exists
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId);
        if (product == null)
            throw new Exception("Product not found");

        // 3. Create review entity
        var review = new Review
        {
            Id = Guid.NewGuid(),
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Reviews.Add(review);
        await _unitOfWork.SaveChangesAsync();

        // 4. Return DTO
        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName = user.FullName,
            UserAvatarUrl = user.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<IEnumerable<ReviewDto>> GetProductReviewsAsync(Guid productId)
    {
        var reviews = await _unitOfWork.Reviews.GetByProductIdAsync(productId);
        
        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            ProductId = r.ProductId,
            UserId = r.UserId,
            UserName = r.User.FullName,
            UserAvatarUrl = r.User.AvatarUrl,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task DeleteReviewAsync(Guid reviewId, Guid userId)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
        if (review == null)
            throw new Exception("Review not found");

        if (review.UserId != userId)
            throw new Exception("Unauthorized to delete this review");

        _unitOfWork.Reviews.Remove(review);
        await _unitOfWork.SaveChangesAsync();
    }
}
