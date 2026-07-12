using System;
using System.Collections.Generic;
using CraftVision.Domain.Enums;

namespace CraftVision.Application.DTOs.Product;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    
    public string? ThumbnailUrl { get; set; }
    public string? SampleImageUrl { get; set; }
    public List<string> Images { get; set; } = new();
    
    public string ProductType { get; set; } = string.Empty;
    public bool SupportsNfc { get; set; }
    public int? EstimatedProductionDays { get; set; }
    public string? CategoryName { get; set; }
}
