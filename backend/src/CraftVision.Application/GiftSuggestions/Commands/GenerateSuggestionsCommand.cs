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
            // Tạm thời comment logic gọi AI thật để tránh lỗi API và test giao diện mượt mà (Mock Data)
            /*
            // 1. Quota Check
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
            */

            // Giả lập AI đang suy nghĩ trong 1.5 giây
            await Task.Delay(1500, cancellationToken);

            return new List<GiftSuggestionDto>
            {
                new GiftSuggestionDto
                {
                    Id = Guid.NewGuid(),
                    Name = $"Làm quà tặng theo ý tưởng: '{request.Prompt}'",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                    EstimatedCostRange = "50.000đ - 100.000đ",
                    EstimatedTime = "2 giờ",
                    Description = "Một món quà tự làm mang đầy tâm huyết và tình cảm, rất dễ thực hiện cho người mới bắt đầu.",
                    TotalCost = "75.000đ",
                    SearchKeyword = "Đồ handmade",
                    VideoUrl = "https://youtube.com/watch?v=mock1",
                    MaterialsJson = "[{\"name\": \"Giấy nhún màu sắc\", \"quantity\": \"5 cuộn\", \"price\": \"10.000đ\", \"total\": \"50.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Keo nến\", \"quantity\": \"5 cây\", \"price\": \"2.000đ\", \"total\": \"10.000đ\"}, {\"name\": \"Đèn LED đóm mini\", \"quantity\": \"1 dây\", \"price\": \"15.000đ\", \"total\": \"15.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Lồng đèn Trung Thu handmade",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "100.000đ - 200.000đ",
                    EstimatedTime = "4 giờ",
                    Description = "Sử dụng tre và giấy kiếng để làm lồng đèn truyền thống cực đẹp.",
                    TotalCost = "55.000đ",
                    SearchKeyword = "Giấy kiếng lồng đèn",
                    VideoUrl = "https://youtube.com/watch?v=mock2",
                    MaterialsJson = "[{\"name\": \"Thanh tre vót sẵn\", \"quantity\": \"10 thanh\", \"price\": \"2.000đ\", \"total\": \"20.000đ\"}, {\"name\": \"Giấy kiếng đủ màu\", \"quantity\": \"5 tờ\", \"price\": \"5.000đ\", \"total\": \"25.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Kẽm buộc\", \"quantity\": \"1 cuộn\", \"price\": \"10.000đ\", \"total\": \"10.000đ\"}]"
                }
            };
        }
    }
}
