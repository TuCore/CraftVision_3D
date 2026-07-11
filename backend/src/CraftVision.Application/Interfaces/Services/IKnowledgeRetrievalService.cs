using CraftVision.Domain.Entities;
using Pgvector;

namespace CraftVision.Application.Interfaces.Services
{
    public interface IKnowledgeRetrievalService
    {
        Task SeedKnowledgeBaseFromFilesAsync();
        Task SeedKnowledgeBaseAsync(IEnumerable<KnowledgeMaterial> materials, IEnumerable<KnowledgeTutorial> tutorials);
        Task<List<KnowledgeMaterial>> SearchMaterialsAsync(Vector queryVector, int topK = 5, double similarityThreshold = 0.7);
        Task<List<KnowledgeTutorial>> SearchTutorialsAsync(Vector queryVector, int topK = 3, double similarityThreshold = 0.7);
    }
}
