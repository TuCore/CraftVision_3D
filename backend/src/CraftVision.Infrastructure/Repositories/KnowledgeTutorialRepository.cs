using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class KnowledgeTutorialRepository : IKnowledgeTutorialRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public KnowledgeTutorialRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(KnowledgeTutorial tutorial)
        {
            await _dbContext.KnowledgeTutorials.AddAsync(tutorial);
            await _dbContext.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<KnowledgeTutorial> tutorials)
        {
            await _dbContext.KnowledgeTutorials.AddRangeAsync(tutorials);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<KnowledgeTutorial>> FindSimilarAsync(Vector queryEmbedding, int topK, double similarityThreshold = 0)
        {
            return await _dbContext.KnowledgeTutorials
                .OrderBy(t => t.Embedding!.CosineDistance(queryEmbedding))
                .Take(topK)
                .ToListAsync();
        }

        public async Task<bool> AnyAsync()
        {
            return await _dbContext.KnowledgeTutorials.AnyAsync();
        }
    }
}
