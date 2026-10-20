using CraftVision.Application.GiftSuggestions.Dtos;

namespace CraftVision.Application.DTOs.Chat;

public class ChatSessionDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public List<ChatMessageItemDto> Messages { get; set; } = new();
}

public class ChatMessageItemDto
{
    public Guid Id { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<GiftSuggestionDto>? Suggestions { get; set; }
    public DateTime CreatedAt { get; set; }
}
