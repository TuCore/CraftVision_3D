using System;

namespace CraftVision.Domain.Entities;

public class GiftAiProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GiftId { get; set; }
    public Guid GiftCategoryId { get; set; }
    
    public string? Relationship { get; set; }
    public string? WritingStyle { get; set; }
    public string? MessageLength { get; set; }
    public string? EmojiLevel { get; set; }
    public string? Language { get; set; }
    public string? AdditionalContext { get; set; }
    public string? DesignPrompt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Gift? Gift { get; set; }
    public GiftCategory? GiftCategory { get; set; }
}
