using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class KnowledgeRepository : IKnowledgeRepository
    {
        private readonly ApplicationDbContext _context;

        public KnowledgeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<KnowledgeMaterial>> SearchSimilarMaterialsAsync(
            float[] queryVector, 
            int topK = 5, 
            string? occasion = null, 
            Difficulty? difficulty = null, 
            decimal? maxCost = null)
        {
            var vector = new Vector(queryVector);
            
            var query = _context.KnowledgeMaterials
                .Where(m => m.IsActive);

            if (!string.IsNullOrEmpty(occasion))
            {
                query = query.Where(m => m.Occasion == occasion || m.Occasion == null);
            }

            if (difficulty.HasValue)
            {
                query = query.Where(m => m.Difficulty == difficulty.Value || m.Difficulty == null);
            }

            if (maxCost.HasValue)
            {
                query = query.Where(m => m.EstimatedCost <= maxCost.Value || m.EstimatedCost == null);
            }

            // EF Core translates CosineDistance to <=> operator in PostgreSQL (Cosine distance)
            // Order by distance ascending means most similar first
            return await query
                .OrderBy(m => m.Embedding!.CosineDistance(vector))
                .Take(topK)
                .ToListAsync();
        }

        public async Task<List<KnowledgeTutorial>> SearchSimilarTutorialsAsync(
            float[] queryVector, 
            int topK = 5, 
            string? occasion = null, 
            Difficulty? difficulty = null, 
            int? maxMinutes = null)
        {
            var vector = new Vector(queryVector);
            
            var query = _context.KnowledgeTutorials.AsQueryable();

            if (!string.IsNullOrEmpty(occasion))
            {
                query = query.Where(t => t.Occasion == occasion || t.Occasion == null);
            }

            if (difficulty.HasValue)
            {
                query = query.Where(t => t.Difficulty == difficulty.Value || t.Difficulty == null);
            }

            if (maxMinutes.HasValue)
            {
                query = query.Where(t => t.EstimatedMinutes <= maxMinutes.Value || t.EstimatedMinutes == null);
            }

            return await query
                .OrderBy(t => t.Embedding!.CosineDistance(vector))
                .Take(topK)
                .ToListAsync();
        }
    }
}
