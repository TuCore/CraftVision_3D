using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IAiChatSessionRepository
    {
        Task AddAsync(AiChatSession session);
        Task<AiChatSession?> GetByIdAsync(Guid id);
        Task<IEnumerable<AiChatSession>> GetUserSessionsAsync(Guid userId);
        Task<AiChatSession?> GetSessionWithMessagesAsync(Guid sessionId);
    }
}
