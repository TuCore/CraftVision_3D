using System;

namespace CraftVision.Application.DTOs.GiftCategory;

public class GiftCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? PromptTemplate { get; set; }
    public int DisplayOrder { get; set; }
}
