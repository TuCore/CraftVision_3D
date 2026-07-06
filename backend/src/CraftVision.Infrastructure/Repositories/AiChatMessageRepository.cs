using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class AiChatMessageRepository : IAiChatMessageRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public AiChatMessageRepository(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        public async Task AddAsync(AiChatMessage message)
        {
            await _dbContext.AiChatMessages.AddAsync(message);
        }

        public async Task<IEnumerable<AiChatMessage>> GetMessagesBySessionIdAsync(Guid sessionId)
        {
            return await _dbContext.AiChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AiChatMessage>> GetRecentMessagesBySessionIdAsync(Guid sessionId, int count = 10)
        {
            var recentMessages = await _dbContext.AiChatMessages
                .Where(m => m.SessionId == sessionId)
                .OrderByDescending(m => m.CreatedAt)
                .Take(count)
                .ToListAsync();
                
            recentMessages.Reverse();
            return recentMessages;
        }
    }
}
