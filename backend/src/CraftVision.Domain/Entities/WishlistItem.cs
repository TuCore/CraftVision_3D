using System;

namespace CraftVision.Domain.Entities;

public class WishlistItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WishlistId { get; set; }
    public Guid ProductId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Wishlist Wishlist { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
