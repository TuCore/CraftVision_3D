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
            var materialDtos = await ReadAndDeserializeAsync<MaterialSeedDto>("materials.json");
            var materials = materialDtos.Select(m => new KnowledgeMaterial
            {
                Name = m.Name,
                Category = m.Category,
                CurrentPrice = m.CurrentPrice,
                Unit = MapVietnameseUnit(m.Unit),
                PurchaseUrl = m.PurchaseUrl,
                ImageUrl = m.ImageUrl
            }).ToList();

            var tutorials = await ReadAndDeserializeAsync<KnowledgeTutorial>("tutorials.json");
            await SeedKnowledgeBaseAsync(materials, tutorials);
        }

        private CraftVision.Domain.Enums.MaterialUnit? MapVietnameseUnit(string unitStr)
        {
            if (string.IsNullOrEmpty(unitStr)) return null;
            var s = unitStr.ToLower();
            if (s.Contains("mét")) return CraftVision.Domain.Enums.MaterialUnit.meter;
            if (s.Contains("gói") || s.Contains("bịch") || s.Contains("hộp") || s.Contains("hũ")) return CraftVision.Domain.Enums.MaterialUnit.pack;
            if (s.Contains("bộ") || s.Contains("combo")) return CraftVision.Domain.Enums.MaterialUnit.set;
            if (s.Contains("kg") || (s.Contains("g") && !s.Contains("gói"))) return CraftVision.Domain.Enums.MaterialUnit.gram;
            if (s.Contains("chai") || s.Contains("ml") || s.Contains("lít")) return CraftVision.Domain.Enums.MaterialUnit.liter;
            return CraftVision.Domain.Enums.MaterialUnit.piece; // cuộn, cái, dây, vv.
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

        public async Task<List<KnowledgeMaterial>> SearchMaterialsAsync(Vector queryVector, int topK = 5, double similarityThreshold = 0.7)
        {
            return await _unitOfWork.KnowledgeMaterials.FindSimilarAsync(queryVector, topK, similarityThreshold);
        }

        public async Task<List<KnowledgeTutorial>> SearchTutorialsAsync(Vector queryVector, int topK = 3, double similarityThreshold = 0.7)
        {
            return await _unitOfWork.KnowledgeTutorials.FindSimilarAsync(queryVector, topK, similarityThreshold);
        }
    }

    public class MaterialSeedDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public decimal? CurrentPrice { get; set; }
        public string? Unit { get; set; }
        public string? PurchaseUrl { get; set; }
        public string? ImageUrl { get; set; }
    }
}
