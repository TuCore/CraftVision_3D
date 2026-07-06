using CraftVision.Domain.Entities;

namespace CraftVision.Application.DTOs.Chat
{
    public class ChatMessageResult
    {
        public AiChatMessage Message { get; set; } = null!;
        public List<ChatSourceDto>? Sources { get; set; }
    }

    public class ChatSourceDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Material" or "Tutorial"
        public string Name { get; set; } = string.Empty;
    }
}
