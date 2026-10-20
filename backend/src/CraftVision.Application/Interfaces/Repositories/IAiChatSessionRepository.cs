using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IAiChatSessionRepository
    {
        Task AddAsync(AiChatSession session);
        Task<AiChatSession?> GetByIdAsync(Guid id);
        Task<IEnumerable<AiChatSession>> GetUserSessionsAsync(Guid userId);
        Task<IEnumerable<AiChatSession>> GetUserSessionsWithMessagesAsync(Guid userId);
        Task<AiChatSession?> GetSessionWithMessagesAsync(Guid sessionId);
        Task<IEnumerable<AiChatMessage>> GetSessionMessagesWithDetailsAsync(Guid sessionId, Guid userId);
        Task DeleteSessionAsync(Guid sessionId, Guid userId);
        Task UpdateTitleAsync(Guid sessionId, Guid userId, string newTitle);
    }
}
