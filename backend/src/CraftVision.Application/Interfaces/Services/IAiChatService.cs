using CraftVision.Application.DTOs.Chat;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Services
{
    public interface IAiChatService
    {
        Task<AiChatSession> CreateSessionAsync(Guid userId, string? title = null);
        Task<IEnumerable<AiChatSession>> GetUserSessionsAsync(Guid userId);
        Task<IEnumerable<AiChatMessage>> GetSessionMessagesAsync(Guid sessionId);
        Task<ChatMessageResult> SendMessageAsync(Guid userId, Guid sessionId, string content);
    }
}
