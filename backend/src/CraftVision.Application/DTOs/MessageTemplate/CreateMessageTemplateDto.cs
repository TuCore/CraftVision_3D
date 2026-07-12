using System;

namespace CraftVision.Application.DTOs.MessageTemplate;

public class CreateMessageTemplateDto
{
    public Guid GiftCategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsPremium { get; set; }
}
