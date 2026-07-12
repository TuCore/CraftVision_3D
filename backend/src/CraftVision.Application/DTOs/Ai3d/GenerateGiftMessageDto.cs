using System;

namespace CraftVision.Application.DTOs.Ai3d;

public class GenerateGiftMessageDto
{
    public Guid GiftCategoryId { get; set; }
    public string? Relationship { get; set; }
    public string? WritingStyle { get; set; }
    public string? MessageLength { get; set; }
    public string? EmojiLevel { get; set; }
    public string? Language { get; set; }
    public string? AdditionalContext { get; set; }
}
