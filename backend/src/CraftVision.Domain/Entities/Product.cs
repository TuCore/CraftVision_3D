using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductCategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? SKU { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    
    public int Stock { get; set; } 
    
    public string? SampleImageUrl { get; set; }
    
    public ProductType ProductType { get; set; } = ProductType.InStock;
    public bool SupportsNfc { get; set; }
    public int? EstimatedProductionDays { get; set; }
    public bool IsActive { get; set; } = true;
    
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ProductCategory? ProductCategory { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}
