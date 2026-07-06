using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IAiChatMessageRepository
    {
        Task AddAsync(AiChatMessage message);
        Task<IEnumerable<AiChatMessage>> GetMessagesBySessionIdAsync(Guid sessionId);
        Task<IEnumerable<AiChatMessage>> GetRecentMessagesBySessionIdAsync(Guid sessionId, int count = 10);
    }
}
