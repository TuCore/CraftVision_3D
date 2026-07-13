using System.ComponentModel.DataAnnotations;

namespace CraftVision.Application.DTOs.AiGreeting;

public class GreetingRequestDto
{
    [Required]
    public string Tone { get; set; } = string.Empty;

    [Required]
    public string Occasion { get; set; } = string.Empty;

    [Required]
    public string Length { get; set; } = string.Empty;

    [Required]
    public string RecipientTrait { get; set; } = string.Empty;

    [Required]
    public string GiftType { get; set; } = string.Empty;

    [Required]
    public string VisualStyle { get; set; } = string.Empty;

    // User Data
    [Required]
    public string SenderName { get; set; } = string.Empty;

    [Required]
    public string ReceiverName { get; set; } = string.Empty;

    public string Relationship { get; set; } = string.Empty;

    public string SpecialMemory { get; set; } = string.Empty;

    public string ExtraDetails { get; set; } = string.Empty;
}
