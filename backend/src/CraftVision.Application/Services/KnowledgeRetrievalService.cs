using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using CraftVision.Domain.Entities;
using Pgvector;

namespace CraftVision.Application.Services
{
    public class KnowledgeRetrievalService : IKnowledgeRetrievalService
    {
        private readonly IEmbeddingProvider _embeddingProvider;
        private readonly IUnitOfWork _unitOfWork;

        public KnowledgeRetrievalService(
            IEmbeddingProvider embeddingProvider,
            IUnitOfWork unitOfWork)
        {
            _embeddingProvider = embeddingProvider;
            _unitOfWork = unitOfWork;
        }

        public async Task SeedKnowledgeBaseFromFilesAsync()
        {
            var materials = await ReadAndDeserializeAsync<KnowledgeMaterial>("materials.json");
            var tutorials = await ReadAndDeserializeAsync<KnowledgeTutorial>("tutorials.json");
            await SeedKnowledgeBaseAsync(materials, tutorials);
        }

        private async Task<List<T>> ReadAndDeserializeAsync<T>(string fileName)
        {
            var basePath = Directory.GetCurrentDirectory();
            
            if (basePath.EndsWith("CraftVision.Presentation"))
            {
                basePath = Path.GetFullPath(Path.Combine(basePath, "..", "..", ".."));
            }

            var filePath = Path.Combine(basePath, "databases", "seed_data", fileName);

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Seed file missing: {filePath}");

            var jsonContent = await File.ReadAllTextAsync(filePath);
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            options.Converters.Add(new JsonStringEnumConverter());
            
            return JsonSerializer.Deserialize<List<T>>(jsonContent, options) ?? new List<T>();
        }

        public async Task SeedKnowledgeBaseAsync(IEnumerable<KnowledgeMaterial> materials, IEnumerable<KnowledgeTutorial> tutorials)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var material in materials)
                {
                    var textToEmbed = $"{material.Name} {material.Category}".Trim();
                    var vector = await _embeddingProvider.GenerateEmbeddingAsync(textToEmbed);
                    material.Embedding = new Vector(vector);
                }
                await _unitOfWork.KnowledgeMaterials.AddRangeAsync(materials);

                foreach (var tutorial in tutorials)
                {
                    var textToEmbed = $"{tutorial.Title} {tutorial.Difficulty}".Trim();
                    var vector = await _embeddingProvider.GenerateEmbeddingAsync(textToEmbed);
                    tutorial.Embedding = new Vector(vector);
                }
                await _unitOfWork.KnowledgeTutorials.AddRangeAsync(tutorials);
                
                await _unitOfWork.CommitTransactionAsync();
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<List<KnowledgeMaterial>> SearchMaterialsAsync(string queryText, int topK = 5, double similarityThreshold = 0.7)
        {
            var vectorArray = await _embeddingProvider.GenerateEmbeddingAsync(queryText);
            var queryVector = new Vector(vectorArray);
            return await _unitOfWork.KnowledgeMaterials.FindSimilarAsync(queryVector, topK, similarityThreshold);
        }

        public async Task<List<KnowledgeTutorial>> SearchTutorialsAsync(string queryText, int topK = 3, double similarityThreshold = 0.7)
        {
            var vectorArray = await _embeddingProvider.GenerateEmbeddingAsync(queryText);
            var queryVector = new Vector(vectorArray);
            return await _unitOfWork.KnowledgeTutorials.FindSimilarAsync(queryVector, topK, similarityThreshold);
        }
    }
}
