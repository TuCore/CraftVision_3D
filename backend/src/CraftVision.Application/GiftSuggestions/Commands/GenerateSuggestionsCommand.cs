using CraftVision.Application.GiftSuggestions.Dtos;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using MediatR;
using System.Text;
using System.Diagnostics;
using CraftVision.Application.Common.Diagnostics;
using CraftVision.Application.Common.Diagnostics.Models;
using Microsoft.Extensions.Configuration;

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
        private readonly IAiProfiler _profiler;
        private readonly IConfiguration _configuration;
        // private readonly IUserRepository _userRepository; // To check Quota

        public GenerateSuggestionsCommandHandler(
            IGeminiVisionService visionService,
            IEmbeddingService embeddingService,
            IKnowledgeRepository knowledgeRepository,
            IAiSuggestionGenerator suggestionGenerator,
            IAiProfiler profiler,
            IConfiguration configuration)
        {
            _visionService = visionService;
            _embeddingService = embeddingService;
            _knowledgeRepository = knowledgeRepository;
            _suggestionGenerator = suggestionGenerator;
            _profiler = profiler;
            _configuration = configuration;
        }

        public async Task<List<GiftSuggestionDto>> Handle(GenerateSuggestionsCommand request, CancellationToken cancellationToken)
        {
            var totalSw = Stopwatch.StartNew();
            var stepSw = new Stopwatch();

            var profile = new AiChatProfile
            {
                SessionId = Guid.NewGuid(), // Or request.SessionId if exists
                UserQuestion = request.Prompt ?? "Image Analysis",
                UserQuestionLength = request.Prompt?.Length ?? 0,
                ModelName = _configuration["AiSettings:Gemini:ChatVisionModel"] ?? "gemini-2.5-flash",
                EmbeddingModel = _configuration["AiSettings:Gemini:EmbeddingModel"] ?? "text-embedding-004",
                EmbeddingDimension = int.TryParse(_configuration["AiSettings:Gemini:EmbeddingDimension"], out var dim) ? dim : 768,
                TopKMaterials = 5,
                TopKTutorials = 3
            };

            try
            {
                // Quota Check (TODO: Inject IUserRepository or QuotaService and check if user has available quota)
                
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

                stepSw.Restart();
                var vector = await _embeddingService.GenerateEmbeddingAsync(finalIntent);
                profile.EmbeddingTimeMs = stepSw.ElapsedMilliseconds;

                stepSw.Restart();
                var materials = await _knowledgeRepository.SearchSimilarMaterialsAsync(
                    queryVector: vector, 
                    topK: 5, 
                    occasion: request.Occasion, 
                    difficulty: request.Difficulty, 
                    maxCost: request.MaxCost);

                var tutorials = await _knowledgeRepository.SearchSimilarTutorialsAsync(
                    queryVector: vector,
                    topK: 3);

                profile.SearchTimeMs = stepSw.ElapsedMilliseconds;
                profile.RetrievedMaterials = materials.Count;
                profile.RetrievedTutorials = tutorials.Count;
                profile.RetrievedSources.AddRange(materials.Select(m => $"[Material] {m.Name}"));
                profile.RetrievedSources.AddRange(tutorials.Select(t => $"[Tutorial] {t.Title}"));

                stepSw.Restart();
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
                var contextStr = contextBuilder.ToString();
                profile.PromptBuildTimeMs = stepSw.ElapsedMilliseconds;
                profile.ContextLength = contextStr.Length;
                profile.FinalPromptLength = profile.ContextLength + finalIntent.Length;
                profile.PromptPreview = new string(contextStr.Take(200).ToArray());

                var suggestionResponse = await _suggestionGenerator.GenerateSuggestionsAsync(finalIntent, contextStr);
                var suggestions = suggestionResponse.Suggestions;
                profile.GeminiTimeMs = stepSw.ElapsedMilliseconds;
                profile.GeminiFinishReason = suggestionResponse.FinishReason;
                profile.ResponseLength = System.Text.Json.JsonSerializer.Serialize(suggestions).Length;

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
            catch (System.Net.Http.HttpRequestException ex)
            {
                profile.IsSuccess = false;
                profile.ErrorReason = $"{ex.GetType().Name}: {ex.Message}";
                profile.GeminiStatus = ex.StatusCode.HasValue ? $"{(int)ex.StatusCode} {ex.StatusCode}" : "HTTP Error";
                throw;
            }
            catch (Exception ex)
            {
                profile.IsSuccess = false;
                profile.ErrorReason = $"{ex.GetType().Name}: {ex.Message}";
                throw;
            }
            finally
            {
                totalSw.Stop();
                profile.TotalTimeMs = totalSw.ElapsedMilliseconds;
                _profiler.Log(profile);
            }
        }
    }
}
