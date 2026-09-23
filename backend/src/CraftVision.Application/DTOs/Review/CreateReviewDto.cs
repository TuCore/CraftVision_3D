using System;
using System.ComponentModel.DataAnnotations;

namespace CraftVision.Application.DTOs.Review;

public class CreateReviewDto
{
    [Required]
    public Guid ProductId { get; set; }

    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
}
