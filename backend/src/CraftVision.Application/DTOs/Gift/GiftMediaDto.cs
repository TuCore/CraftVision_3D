using System;

namespace CraftVision.Application.DTOs.Gift;

public class GiftMediaDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string? Caption { get; set; }
}
