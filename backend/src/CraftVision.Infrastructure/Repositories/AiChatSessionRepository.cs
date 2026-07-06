using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class AiChatSessionRepository : IAiChatSessionRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public AiChatSessionRepository(ApplicationDbContext context)
        {
            _dbContext = context;
        }

        public async Task AddAsync(AiChatSession session)
        {
            await _dbContext.AiChatSessions.AddAsync(session);
        }

        public async Task<AiChatSession?> GetByIdAsync(Guid id)
        {
            return await _dbContext.AiChatSessions.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<AiChatSession?> GetSessionWithMessagesAsync(Guid sessionId)
        {
            return await _dbContext.AiChatSessions
                .Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.Id == sessionId);
        }

        public async Task<IEnumerable<AiChatSession>> GetUserSessionsAsync(Guid userId)
        {
            return await _dbContext.AiChatSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.LastActiveAt)
                .ToListAsync();
        }
    }
}
