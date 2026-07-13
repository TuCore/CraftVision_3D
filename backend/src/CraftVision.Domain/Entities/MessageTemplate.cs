using System;

namespace CraftVision.Domain.Entities;

public class MessageTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GiftCategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPremium { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public GiftCategory? GiftCategory { get; set; }
}
