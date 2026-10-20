using System;
using System.Collections.Generic;
using CraftVision.Application.DTOs.Product;

namespace CraftVision.Application.DTOs.Wishlist;

public class WishlistDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public ProductDto Product { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
