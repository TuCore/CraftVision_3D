using System;
using System.Collections.Generic;
using CraftVision.Domain.Enums;

namespace CraftVision.Application.DTOs.Product;

public class CreateProductDto
{
    public Guid ProductCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    
    public string? ThumbnailUrl { get; set; }
    public string? SampleImageUrl { get; set; }
    public List<Guid>? ProductImageFileIds { get; set; }
    
    public string ProductType { get; set; } = string.Empty;
    public bool SupportsNfc { get; set; }
    public int? EstimatedProductionDays { get; set; }
}
