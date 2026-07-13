using System;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class ProductImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Guid FileId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsThumbnail { get; set; }
    
    public Product? Product { get; set; }
    public UploadedFile? File { get; set; }
}
