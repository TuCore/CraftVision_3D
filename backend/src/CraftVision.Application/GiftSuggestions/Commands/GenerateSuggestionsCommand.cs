using CraftVision.Application.GiftSuggestions.Dtos;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using MediatR;
using System.Text;

namespace CraftVision.Application.GiftSuggestions.Commands
{
    public class GenerateSuggestionsCommand : IRequest<List<GiftSuggestionDto>>
    {
        public Guid UserId { get; set; }
        public string? Prompt { get; set; }
        public string? ImageUrl { get; set; }
        
        // Constraints
        public decimal? MaxCost { get; set; }
        public string? Occasion { get; set; }
        public CraftVision.Domain.Enums.Difficulty? Difficulty { get; set; }
    }

    public class GenerateSuggestionsCommandHandler : IRequestHandler<GenerateSuggestionsCommand, List<GiftSuggestionDto>>
    {
        private readonly IGeminiVisionService _visionService;
        private readonly IEmbeddingService _embeddingService;
        private readonly IKnowledgeRepository _knowledgeRepository;
        private readonly IAiSuggestionGenerator _suggestionGenerator;
        // private readonly IUserRepository _userRepository; // To check Quota

        public GenerateSuggestionsCommandHandler(
            IGeminiVisionService visionService,
            IEmbeddingService embeddingService,
            IKnowledgeRepository knowledgeRepository,
            IAiSuggestionGenerator suggestionGenerator)
        {
            _visionService = visionService;
            _embeddingService = embeddingService;
            _knowledgeRepository = knowledgeRepository;
            _suggestionGenerator = suggestionGenerator;
        }

        public async Task<List<GiftSuggestionDto>> Handle(GenerateSuggestionsCommand request, CancellationToken cancellationToken)
        {
            // 1. Quota Check (TODO: Inject IUserRepository or QuotaService and check if user has available quota)
            
            // 2. Parse Intent (from Image or Text)
            var intentBuilder = new StringBuilder();
            if (!string.IsNullOrEmpty(request.Prompt))
            {
                intentBuilder.AppendLine($"User prompt: {request.Prompt}");
            }

            if (!string.IsNullOrEmpty(request.ImageUrl) && request.ImageUrl != "string")
            {
                var imageAnalysis = await _visionService.AnalyzeImageAsync(request.ImageUrl, "Describe exactly what the item in the image is. Then, list the materials and provide high-level instructions on how someone can make this exact item as a DIY project.");
                intentBuilder.AppendLine($"Image Analysis: {imageAnalysis}");
            }

            var finalIntent = intentBuilder.ToString();

            // 3. Generate Embedding
            var vector = await _embeddingService.GenerateEmbeddingAsync(finalIntent);

            // 4. Retrieve Context via pgvector
            var materials = await _knowledgeRepository.SearchSimilarMaterialsAsync(
                queryVector: vector, 
                topK: 5, 
                occasion: request.Occasion, 
                difficulty: request.Difficulty, 
                maxCost: request.MaxCost);

            var tutorials = await _knowledgeRepository.SearchSimilarTutorialsAsync(
                queryVector: vector,
                topK: 3);

            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("Materials Found:");
            foreach (var m in materials)
            {
                contextBuilder.AppendLine($"- Name: {m.Name}, Price: {m.CurrentPrice}, Link: {m.PurchaseUrl}");
            }

            contextBuilder.AppendLine("Tutorials Found:");
            foreach (var t in tutorials)
            {
                contextBuilder.AppendLine($"- Title: {t.Title}, VideoLink: {t.VideoUrl}");
            }

            // 5. Generate Suggestions via LLM
            var suggestions = await _suggestionGenerator.GenerateSuggestionsAsync(finalIntent, contextBuilder.ToString());

            // 6. Map to DTOs and return
            return suggestions.Select(s => new GiftSuggestionDto
            {
                Id = s.Id,
                Name = s.Name,
                Difficulty = s.Difficulty,
                EstimatedCostRange = s.EstimatedCostRange,
                EstimatedTime = s.EstimatedTime,
                Description = s.Description,
                TotalCost = s.TotalCost,
                SearchKeyword = s.SearchKeyword,
                VideoUrl = s.VideoUrl,
                MaterialsJson = s.MaterialsJson
            }).ToList();
        }
    }
}
