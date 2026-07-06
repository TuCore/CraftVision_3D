using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IKnowledgeRepository
    {
        // Finds similar materials based on vector and optional metadata filters
        Task<List<KnowledgeMaterial>> SearchSimilarMaterialsAsync(
            float[] queryVector, 
            int topK = 5,
            string? occasion = null,
            CraftVision.Domain.Enums.Difficulty? difficulty = null,
            decimal? maxCost = null);

        // Finds similar tutorials based on vector and optional metadata filters
        Task<List<KnowledgeTutorial>> SearchSimilarTutorialsAsync(
            float[] queryVector, 
            int topK = 5,
            string? occasion = null,
            CraftVision.Domain.Enums.Difficulty? difficulty = null,
            int? maxMinutes = null);
    }
}
