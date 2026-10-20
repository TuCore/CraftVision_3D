namespace CraftVision.Application.DTOs.Chat;

public class ChatSessionSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastActiveAt { get; set; }
    public int MessageCount { get; set; }
    public string? LastMessagePreview { get; set; }
}
