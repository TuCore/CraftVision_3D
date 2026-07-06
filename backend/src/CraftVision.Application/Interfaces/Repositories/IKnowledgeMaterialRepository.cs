using CraftVision.Domain.Entities;
using Pgvector;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IKnowledgeMaterialRepository
    {
        Task AddAsync(KnowledgeMaterial material);
        Task AddRangeAsync(IEnumerable<KnowledgeMaterial> materials);
        Task<List<KnowledgeMaterial>> FindSimilarAsync(Vector queryEmbedding, int topK, double similarityThreshold = 0);
        Task<bool> AnyAsync();
    }
}
