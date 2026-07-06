using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class KnowledgeMaterialRepository : IKnowledgeMaterialRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public KnowledgeMaterialRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(KnowledgeMaterial material)
        {
            await _dbContext.KnowledgeMaterials.AddAsync(material);
            await _dbContext.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<KnowledgeMaterial> materials)
        {
            await _dbContext.KnowledgeMaterials.AddRangeAsync(materials);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<List<KnowledgeMaterial>> FindSimilarAsync(Vector queryEmbedding, int topK, double similarityThreshold = 0)
        {
            var maxDistance = 1.0 - similarityThreshold;
            
            return await _dbContext.KnowledgeMaterials
                .Where(m => m.IsActive)
                .OrderBy(m => m.Embedding!.CosineDistance(queryEmbedding))
                .Take(topK)
                .ToListAsync();
        }

        public async Task<bool> AnyAsync()
        {
            return await _dbContext.KnowledgeMaterials.AnyAsync();
        }
    }
}
