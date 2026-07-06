using CraftVision.Domain.Entities;
using Pgvector;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IKnowledgeTutorialRepository
    {
        Task AddAsync(KnowledgeTutorial tutorial);
        Task AddRangeAsync(IEnumerable<KnowledgeTutorial> tutorials);
        Task<List<KnowledgeTutorial>> FindSimilarAsync(Vector queryEmbedding, int topK, double similarityThreshold = 0);
        Task<bool> AnyAsync();
    }
}
