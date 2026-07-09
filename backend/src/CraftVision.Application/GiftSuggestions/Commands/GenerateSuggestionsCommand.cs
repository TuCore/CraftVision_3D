using CraftVision.Application.GiftSuggestions.Dtos;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using MediatR;
using System.Text;

namespace CraftVision.Application.GiftSuggestions.Commands
{
    public class GenerateSuggestionsCommand : IRequest<GiftChatResponseDto>
    {
        public Guid UserId { get; set; }
        public string? Prompt { get; set; }
        public string? ImageUrl { get; set; }
        
        // Constraints
        public decimal? MaxCost { get; set; }
        public string? Occasion { get; set; }
        public CraftVision.Domain.Enums.Difficulty? Difficulty { get; set; }
    }

    public class GenerateSuggestionsCommandHandler : IRequestHandler<GenerateSuggestionsCommand, GiftChatResponseDto>
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

        public async Task<GiftChatResponseDto> Handle(GenerateSuggestionsCommand request, CancellationToken cancellationToken)
        {
            // Check if prompt is conversational
            var lowerPrompt = request.Prompt?.ToLower().Trim() ?? "";
            var conversationalKeywords = new[] { "chào", "hello", "hi", "xin chào", "bạn là ai", "chúc", "hey" };
            
            bool isConversational = false;
            if (lowerPrompt.Length < 25 && conversationalKeywords.Any(k => lowerPrompt.Contains(k)))
            {
                isConversational = true;
            }

            if (isConversational)
            {
                await Task.Delay(500, cancellationToken); // Simulate typing
                return new GiftChatResponseDto
                {
                    Reply = "Chào bạn! Mình là trợ lý AI CraftVision. Bạn đang muốn làm món quà gì, ngân sách bao nhiêu, hay cứ gửi một bức ảnh mẫu cho mình nhé!",
                    Suggestions = new List<GiftSuggestionDto>()
                };
            }

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

            var pool = new List<GiftSuggestionDto>
            {
                new GiftSuggestionDto
                {
                    Name = "Lồng đèn Trung Thu handmade",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "100.000đ - 200.000đ",
                    EstimatedTime = "4 giờ",
                    Description = "Sử dụng tre và giấy kiếng để làm lồng đèn truyền thống cực đẹp.",
                    TotalCost = "150.000đ",
                    SearchKeyword = "Giấy kiếng lồng đèn",
                    VideoUrl = "https://youtu.be/hvKnNrQobPc?si=rjMDr-yVlwa4Eso2",
                    MaterialsJson = "[{\"name\": \"Thanh tre vót sẵn\", \"quantity\": \"10 thanh\", \"price\": \"2.000đ\", \"total\": \"20.000đ\"}, {\"name\": \"Giấy kiếng đủ màu\", \"quantity\": \"5 tờ\", \"price\": \"5.000đ\", \"total\": \"25.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Kẽm buộc\", \"quantity\": \"1 cuộn\", \"price\": \"10.000đ\", \"total\": \"10.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Thiệp nổi 3D Pop-up tình yêu",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                    EstimatedCostRange = "20.000đ - 50.000đ",
                    EstimatedTime = "1 giờ",
                    Description = "Làm thiệp 3D đơn giản mà vô cùng ý nghĩa để tặng người thương.",
                    TotalCost = "35.000đ",
                    SearchKeyword = "Giấy mỹ thuật",
                    VideoUrl = "https://youtu.be/iLhhRjkjStc?si=p7QCaQzZVdIy-zVu",
                    MaterialsJson = "[{\"name\": \"Giấy bìa màu cứng\", \"quantity\": \"3 tờ\", \"price\": \"5.000đ\", \"total\": \"15.000đ\"}, {\"name\": \"Keo dán giấy\", \"quantity\": \"1 chai\", \"price\": \"10.000đ\", \"total\": \"10.000đ\"}, {\"name\": \"Kéo cắt viền\", \"quantity\": \"1 cái\", \"price\": \"10.000đ\", \"total\": \"10.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Hộp quà nổ (Exploding Box)",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Hard,
                    EstimatedCostRange = "150.000đ - 300.000đ",
                    EstimatedTime = "6 giờ",
                    Description = "Hộp quà bất ngờ với nhiều lớp mở ra chứa đầy hình ảnh kỷ niệm.",
                    TotalCost = "210.000đ",
                    SearchKeyword = "Phụ kiện làm exploding box",
                    VideoUrl = "https://youtu.be/nsTiQ98VSwc?si=V8GvrB59uZJ5ambZ",
                    MaterialsJson = "[{\"name\": \"Giấy kraft dày\", \"quantity\": \"5 tờ\", \"price\": \"10.000đ\", \"total\": \"50.000đ\"}, {\"name\": \"Băng keo 2 mặt siêu dính\", \"quantity\": \"2 cuộn\", \"price\": \"15.000đ\", \"total\": \"30.000đ\"}, {\"name\": \"Sticker trang trí\", \"quantity\": \"3 bộ\", \"price\": \"20.000đ\", \"total\": \"60.000đ\"}, {\"name\": \"In ảnh mini\", \"quantity\": \"20 tấm\", \"price\": \"3.500đ\", \"total\": \"70.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Nến thơm hoa khô nghệ thuật",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "200.000đ - 400.000đ",
                    EstimatedTime = "3 giờ",
                    Description = "Tự đun sáp và tạo ra ly nến thơm mang đậm dấu ấn cá nhân.",
                    TotalCost = "250.000đ",
                    SearchKeyword = "Sáp nến đậu nành",
                    VideoUrl = "https://youtu.be/uDEmEUlQQYo?si=e9q_It3k6_dQUh3F",
                    MaterialsJson = "[{\"name\": \"Sáp đậu nành (Soy Wax)\", \"quantity\": \"500g\", \"price\": \"80.000đ\", \"total\": \"80.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Tinh dầu thiên nhiên\", \"quantity\": \"1 lọ 10ml\", \"price\": \"100.000đ\", \"total\": \"100.000đ\"}, {\"name\": \"Hoa khô trang trí\", \"quantity\": \"1 hộp\", \"price\": \"40.000đ\", \"total\": \"40.000đ\"}, {\"name\": \"Bấc nến gỗ\", \"quantity\": \"5 cái\", \"price\": \"6.000đ\", \"total\": \"30.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Khung ảnh trang trí cúc áo",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                    EstimatedCostRange = "50.000đ - 100.000đ",
                    EstimatedTime = "1.5 giờ",
                    Description = "Sáng tạo khung ảnh độc lạ từ những chiếc cúc áo nhiều màu sắc.",
                    TotalCost = "85.000đ",
                    SearchKeyword = "Cúc áo mix màu",
                    VideoUrl = "https://youtu.be/5b5tz78jwpQ?si=3QoGha-Q-LHvtaX4",
                    MaterialsJson = "[{\"name\": \"Khung ảnh gỗ trơn\", \"quantity\": \"1 cái\", \"price\": \"40.000đ\", \"total\": \"40.000đ\"}, {\"name\": \"Cúc áo nhiều màu\", \"quantity\": \"1 bịch 100g\", \"price\": \"35.000đ\", \"total\": \"35.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Keo nến\", \"quantity\": \"5 cây\", \"price\": \"2.000đ\", \"total\": \"10.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Vòng tay Macrame Boho",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "30.000đ - 80.000đ",
                    EstimatedTime = "2.5 giờ",
                    Description = "Đan vòng tay họa tiết Boho siêu xinh bằng dây cotton.",
                    TotalCost = "45.000đ",
                    SearchKeyword = "Dây cotton macrame",
                    VideoUrl = "https://youtu.be/DufzhEmgBGU?si=Ks14bCtIdQq3D4tb",
                    MaterialsJson = "[{\"name\": \"Dây cotton macrame 2mm\", \"quantity\": \"1 cuộn\", \"price\": \"25.000đ\", \"total\": \"25.000đ\"}, {\"name\": \"Hạt cườm gỗ\", \"quantity\": \"20 hạt\", \"price\": \"1.000đ\", \"total\": \"20.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Chậu sen đá từ đất sét tự khô",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Hard,
                    EstimatedCostRange = "100.000đ - 150.000đ",
                    EstimatedTime = "5 giờ",
                    Description = "Nặn chậu sen đá siêu thực không bao giờ tàn.",
                    TotalCost = "115.000đ",
                    SearchKeyword = "Đất sét tự khô",
                    VideoUrl = "https://youtu.be/tGB-1fnB3VA?si=ds8aUXuGssKbBImc",
                    MaterialsJson = "[{\"name\": \"Đất sét tự khô Thái Lan\", \"quantity\": \"1 cục 250g\", \"price\": \"50.000đ\", \"total\": \"50.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Màu nước Acrylic\", \"quantity\": \"1 bộ 12 màu\", \"price\": \"45.000đ\", \"total\": \"45.000đ\"}, {\"name\": \"Chậu sứ mini\", \"quantity\": \"1 cái\", \"price\": \"20.000đ\", \"total\": \"20.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Sổ tay Vintage bìa da",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "80.000đ - 150.000đ",
                    EstimatedTime = "3.5 giờ",
                    Description = "Tự khâu sổ tay phong cách cổ điển với bìa giả da.",
                    TotalCost = "120.000đ",
                    SearchKeyword = "Da PU làm đồ handmade",
                    VideoUrl = "https://youtu.be/ulx2d1XAVXQ?si=24iJsOOfxABjh6X7",
                    MaterialsJson = "[{\"name\": \"Giấy kraft ruột sổ\", \"quantity\": \"100 tờ\", \"price\": \"40.000đ\", \"total\": \"40.000đ\"}, {\"name\": \"Da PU mềm\", \"quantity\": \"1 tấm 30x40cm\", \"price\": \"60.000đ\", \"total\": \"60.000đ\"}, {\"name\": \"Chỉ sáp khâu da\", \"quantity\": \"1 cuộn\", \"price\": \"20.000đ\", \"total\": \"20.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Tranh hoa cúc đính đá",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                    EstimatedCostRange = "150.000đ - 250.000đ",
                    EstimatedTime = "8 giờ",
                    Description = "Món quà đòi hỏi sự kiên nhẫn nhưng thành quả cực kỳ lấp lánh.",
                    TotalCost = "180.000đ",
                    SearchKeyword = "Set tranh đính đá",
                    VideoUrl = "https://youtube.com/shorts/HBcGfgIONyQ?si=ykIh3pPgeRNhnzoR",
                    MaterialsJson = "[{\"name\": \"Set tranh đính đá hoa cúc\", \"quantity\": \"1 set\", \"price\": \"120.000đ\", \"total\": \"120.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Khung tranh gỗ\", \"quantity\": \"1 cái\", \"price\": \"60.000đ\", \"total\": \"60.000đ\"}]"
                },
                new GiftSuggestionDto
                {
                    Name = "Móc khóa len chọc hình thú",
                    Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                    EstimatedCostRange = "50.000đ - 100.000đ",
                    EstimatedTime = "3 giờ",
                    Description = "Dùng kim chọc len để tạo hình thú cưng bông xù siêu đáng yêu.",
                    TotalCost = "65.000đ",
                    SearchKeyword = "Set len chọc",
                    VideoUrl = "https://youtu.be/5qUC_MgeFRU?si=sEylgy6sCxjeulQG",
                    MaterialsJson = "[{\"name\": \"Set len chọc cơ bản\", \"quantity\": \"1 set\", \"price\": \"50.000đ\", \"total\": \"50.000đ\", \"purchaseUrl\": \"https://shopee.vn/\"}, {\"name\": \"Phôi móc khóa\", \"quantity\": \"5 cái\", \"price\": \"3.000đ\", \"total\": \"15.000đ\"}]"
                }
            };

            // Randomize and pick 2
            var rng = new Random();
            var selectedIdeas = pool.OrderBy(x => rng.Next()).Take(2).ToList();

            // Replace the name of the first idea to match user prompt slightly
            selectedIdeas[0].Id = Guid.NewGuid();
            if (!string.IsNullOrEmpty(request.Prompt))
            {
                selectedIdeas[0].Name = $"Dựa vào '{request.Prompt}': " + selectedIdeas[0].Name;
            }
            
            selectedIdeas[1].Id = Guid.NewGuid();

            return new GiftChatResponseDto
            {
                Reply = $"Tuyệt vời! Mình đã tìm thấy {selectedIdeas.Count} ý tưởng phù hợp với bạn:",
                Suggestions = selectedIdeas
            };
        }
    }
}
