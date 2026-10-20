using System.ComponentModel.DataAnnotations;

namespace CraftVision.Application.DTOs.Chat;

public class UpdateChatSessionTitleDto
{
    [Required, StringLength(100)]
    public string Title { get; set; } = string.Empty;
}
