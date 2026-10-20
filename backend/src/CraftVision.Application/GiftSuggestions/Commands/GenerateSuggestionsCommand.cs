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
        private readonly IProductRepository _productRepository;
        private readonly IAiSuggestionGenerator _suggestionGenerator;
        private readonly IAiProfiler _profiler;
        private readonly IConfiguration _configuration;

        public GenerateSuggestionsCommandHandler(
            IGeminiVisionService visionService,
            IEmbeddingService embeddingService,
            IKnowledgeRepository knowledgeRepository,
            IProductRepository productRepository,
            IAiSuggestionGenerator suggestionGenerator,
            IAiProfiler profiler,
            IConfiguration configuration)
        {
            _visionService = visionService;
            _embeddingService = embeddingService;
            _knowledgeRepository = knowledgeRepository;
            _productRepository = productRepository;
            _suggestionGenerator = suggestionGenerator;
            _profiler = profiler;
            _configuration = configuration;
        }

        public async Task<GiftChatResponseDto> Handle(GenerateSuggestionsCommand request, CancellationToken cancellationToken)
        {
            var totalSw = Stopwatch.StartNew();
            var stepSw = new Stopwatch();

            var profile = new AiChatProfile
            {
                SessionId = Guid.NewGuid(),
                UserQuestion = request.Prompt ?? "Image Analysis",
                UserQuestionLength = request.Prompt?.Length ?? 0,
                ModelName = _configuration["AiSettings:Gemini:ChatVisionModel"] ?? "gemini-2.5-flash",
                EmbeddingModel = _configuration["AiSettings:Gemini:EmbeddingModel"] ?? "text-embedding-004",
                EmbeddingDimension = int.TryParse(_configuration["AiSettings:Gemini:EmbeddingDimension"], out var dim) ? dim : 768,
                TopKMaterials = 5,
                TopKTutorials = 3
            };

            List<Product> dbProducts = new();
            try
            {
                var (dbProductItems, _) = await _productRepository.SearchAndFilterAsync(new DTOs.Product.ProductFilterDto
                {
                    Page = 1,
                    PageSize = 50
                });
                var comingSoonProductId = Guid.Parse("8e8c802b-5ada-49e2-aa71-404dab05948f");
                dbProducts = dbProductItems
                    .Where(p => p.IsActive
                        && p.Stock > 0
                        && p.ProductType == Domain.Enums.ProductType.InStock
                        && p.SupportsNfc
                        && p.Id != comingSoonProductId
                        && p.Price > 0
                        && p.Price <= 50_000_000
                        && !p.Name.Contains("hehe", StringComparison.OrdinalIgnoreCase)
                        && !p.Name.Contains("thúi", StringComparison.OrdinalIgnoreCase)
                        && !p.Name.Contains("coming soon", StringComparison.OrdinalIgnoreCase)
                        && (p.Description == null || !p.Description.Contains("coming soon", StringComparison.OrdinalIgnoreCase)))
                    .GroupBy(p => new { NameKey = p.Name.Trim().ToLowerInvariant(), p.Price })
                    .Select(g => g.OrderByDescending(x => x.Stock).First())
                    .OrderBy(p => p.Price)
                    .ToList();
            }
            catch
            {
                // Ignore product lookup errors so chat can still proceed
            }

            TryExtractBudgetFromPrompt(request.Prompt, request.MaxCost, out var minBudget, out var maxBudget);

            var candidateProducts = dbProducts;
            if (maxBudget.HasValue)
            {
                var inRange = dbProducts
                    .Where(p => p.Price >= (minBudget ?? 0) && p.Price <= maxBudget.Value)
                    .ToList();
                if (!inRange.Any())
                {
                    inRange = dbProducts.Where(p => p.Price <= maxBudget.Value).ToList();
                }
                if (inRange.Any())
                {
                    candidateProducts = inRange;
                }
            }

            try
            {
                // Check if prompt is a pure greeting
                var lowerPrompt = request.Prompt?.ToLower().Trim() ?? "";
                var exactGreetings = new HashSet<string> { "chào", "hello", "hi", "xin chào", "chào bạn", "chào shop", "hey", "alo" };
                bool isPureGreeting = string.IsNullOrEmpty(request.ImageUrl) && exactGreetings.Contains(lowerPrompt);

                if (isPureGreeting)
                {
                    await Task.Delay(300, cancellationToken);
                    var featuredNames = candidateProducts.Take(4)
                        .Select(p => $"{p.Name} ({p.Price:N0}đ)")
                        .ToList();
                    var productIntro = featuredNames.Any()
                        ? $" Hiện tại trên web CraftVision 3D đang có sẵn các sản phẩm handmade tích hợp thẻ thông minh NFC như: {string.Join(", ", featuredNames)}."
                        : "";

                    return new GiftChatResponseDto
                    {
                        Reply = $"Chào bạn! Mình là trợ lý AI của CraftVision 3D.{productIntro} Bạn đang muốn tìm quà tặng cho dịp gì, ngân sách bao nhiêu, hay muốn tự làm đồ DIY? Hãy nhắn cho mình biết nhé — mình sẽ gợi ý cách làm kèm link nguyên liệu Shopee, video YouTube, hoặc hướng dẫn bạn chọn sản phẩm có sẵn trên web để gắn Thiệp 3D NFC và thanh toán ngay!",
                        Suggestions = new List<GiftSuggestionDto>()
                    };
                }

                bool hasImage = !string.IsNullOrEmpty(request.ImageUrl) && request.ImageUrl != "string";
                var requestedTopicKeywords = hasImage ? new List<string>() : ExtractRequestedTopicKeywords(lowerPrompt);

                // Parse Intent (from Image or Text)
                var intentBuilder = new StringBuilder();
                if (!string.IsNullOrEmpty(request.Prompt))
                {
                    intentBuilder.AppendLine($"User prompt: {request.Prompt}");
                }
                if (requestedTopicKeywords.Any())
                {
                    intentBuilder.AppendLine($"STRICT TOPIC CONSTRAINT: The user specifically asked about [{string.Join(", ", requestedTopicKeywords)}]. 100% of your 'suggestions' MUST be about [{string.Join(", ", requestedTopicKeywords)}] ONLY! NEVER add unrelated items (e.g., do NOT suggest 'Móc khóa len' if the user only asked about 'hoa' or 'ngôi sao' or 'vòng tay')!");
                }
                if (minBudget.HasValue && maxBudget.HasValue)
                {
                    intentBuilder.AppendLine($"STRICT BUDGET CONSTRAINT: Every DIY suggestion 'totalCost', 'estimatedCostRange' upper bound, and every recommended Shop Product price MUST be strictly between {minBudget.Value:N0}đ and {maxBudget.Value:N0}đ (NEVER exceed {maxBudget.Value:N0}đ!).");
                }
                else if (maxBudget.HasValue)
                {
                    intentBuilder.AppendLine($"STRICT BUDGET CONSTRAINT: Every DIY suggestion 'totalCost', 'estimatedCostRange' upper bound, and every recommended Shop Product price MUST be strictly <= {maxBudget.Value:N0}đ (NEVER exceed {maxBudget.Value:N0}đ!).");
                }
                if (!string.IsNullOrEmpty(request.Occasion))
                {
                    intentBuilder.AppendLine($"Occasion: {request.Occasion}");
                }

                if (hasImage)
                {
                    var shopListForVision = string.Join("\n", candidateProducts.Select(p =>
                        $"- ProductId: {p.Id} | Name: {p.Name} ({p.Price:N0}đ) | Mô tả: {p.Description}"));

                    var visionPrompt = $@"Bạn là chuyên gia nhận diện quà tặng handmade của CraftVision 3D.
Hãy nhìn kỹ bức ảnh người dùng tải lên và trả lời chính xác bằng tiếng Việt theo 3 mục sau:
1. MÓN ĐỒ TRONG ẢNH: Mô tả rõ đây là món đồ gì, hình dáng con vật/đồ vật gì, màu sắc gì, và làm từ chất liệu thủ công gì (ví dụ: thú bông/cún bông làm từ kẽm lông nhung xù (velvet/fuzzy wire), móc khóa len móc amigurumi, bó hoa kẽm nhung, mô hình hạt nhựa ủi pixel, mô hình lắp ráp lego, ngôi sao giấy may mắn, hay vòng tay hạt cườm).
2. SẢN PHẨM SHOP GIỐNG NHẤT: Đối chiếu với danh sách sản phẩm của Shop dưới đây và chọn ra đúng 1-2 sản phẩm phù hợp nhất (ghi rõ ProductId, Name và Giá):
{shopListForVision}
3. NGUYÊN LIỆU CẦN MUA TRÊN SHOPEE: Liệt kê 3 nguyên liệu chính xác nhất để tự làm món đồ giống hệt trong bức ảnh này.";

                    var imageAnalysis = await _visionService.AnalyzeImageAsync(request.ImageUrl!, visionPrompt);
                    intentBuilder.AppendLine($"=== IMAGE ANALYSIS RESULT (CRITICAL) ===\n{imageAnalysis}");
                    intentBuilder.AppendLine("STRICT IMAGE RULE: Because the user uploaded a photo, 100% of your 'suggestions' (return 2 suggestions) and your 'reply' MUST be about making the EXACT item identified in 'MÓN ĐỒ TRONG ẢNH' above and matching the 'SẢN PHẨM SHOP GIỐNG NHẤT' above! NEVER suggest unrelated items (like beaded bracelets, resin charms, or lucky stars) if the photo is a plushie/animal keychain or flower!");

                    requestedTopicKeywords = ExtractRequestedTopicKeywords(imageAnalysis);
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
                    maxCost: maxBudget);

                var tutorials = await _knowledgeRepository.SearchSimilarTutorialsAsync(
                    queryVector: vector,
                    topK: 3);

                profile.SearchTimeMs = stepSw.ElapsedMilliseconds;
                profile.RetrievedMaterials = materials.Count;
                profile.RetrievedTutorials = tutorials.Count;
                profile.RetrievedSources.AddRange(materials.Select(m => $"[Material] {m.Name}"));
                profile.RetrievedSources.AddRange(tutorials.Select(t => $"[Tutorial] {t.Title}"));
                profile.RetrievedSources.AddRange(candidateProducts.Take(5).Select(p => $"[Product] {p.Name}"));

                stepSw.Restart();
                var contextBuilder = new StringBuilder();
                contextBuilder.AppendLine("[AVAILABLE SHOP PRODUCTS IN DATABASE (ACTIVE & IN-STOCK ONLY)]:");
                foreach (var p in candidateProducts)
                {
                    var nfcLabel = p.SupportsNfc ? "Supports 3D NFC Greeting Card" : "Standard Product";
                    contextBuilder.AppendLine($"- ProductId: {p.Id} | Name: {p.Name} | Category: {p.ProductCategory?.Name ?? "Handmade"} | Price: {p.Price:N0}đ | Stock: {p.Stock} | NFC: {nfcLabel} | Description: {p.Description}");
                }

                contextBuilder.AppendLine("\n[AVAILABLE MATERIALS]:");
                foreach (var m in materials)
                {
                    var matUrl = !string.IsNullOrWhiteSpace(m.PurchaseUrl)
                        ? m.PurchaseUrl
                        : $"https://shopee.vn/search?keyword={Uri.EscapeDataString(m.SearchKeywords ?? m.Name)}";
                    contextBuilder.AppendLine($"- Name: {m.Name} | Price: {m.CurrentPrice:N0}đ | Keyword: {m.SearchKeywords ?? m.Name} | PurchaseUrl: {matUrl}");
                }

                contextBuilder.AppendLine("\n[AVAILABLE TUTORIALS]:");
                foreach (var t in tutorials)
                {
                    contextBuilder.AppendLine($"- Title: {t.Title} | Difficulty: {t.Difficulty} | VideoUrl: {t.VideoUrl}");
                }
                var contextStr = contextBuilder.ToString();
                profile.PromptBuildTimeMs = stepSw.ElapsedMilliseconds;
                profile.ContextLength = contextStr.Length;
                profile.FinalPromptLength = profile.ContextLength + finalIntent.Length;
                profile.PromptPreview = new string(contextStr.Take(200).ToArray());

                var suggestionResponse = await _suggestionGenerator.GenerateSuggestionsAsync(finalIntent, contextStr);
                var suggestions = suggestionResponse.Suggestions;

                // Post-filter off-topic suggestions if user explicitly requested specific craft types or uploaded an image
                if (requestedTopicKeywords.Any() && suggestions.Count > 1)
                {
                    var topicMatched = suggestions
                        .Where(s => requestedTopicKeywords.Any(kw =>
                            (s.Name != null && s.Name.Contains(kw, StringComparison.OrdinalIgnoreCase)) ||
                            (s.Description != null && s.Description.Contains(kw, StringComparison.OrdinalIgnoreCase))))
                        .ToList();

                    if (topicMatched.Any())
                    {
                        suggestions = topicMatched;
                    }
                }

                profile.GeminiTimeMs = stepSw.ElapsedMilliseconds;
                profile.GeminiFinishReason = suggestionResponse.FinishReason;
                profile.ResponseLength = System.Text.Json.JsonSerializer.Serialize(suggestions).Length;

                var giftSuggestions = suggestions.Select((s, index) =>
                {
                    var matchedProd = FindBestMatchingProduct(
                        s.MatchedProductId,
                        s.MatchedProductName,
                        s.Name,
                        s.Description,
                        candidateProducts,
                        index);

                    return new GiftSuggestionDto
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Difficulty = s.Difficulty,
                        EstimatedCostRange = s.EstimatedCostRange,
                        EstimatedTime = s.EstimatedTime,
                        Description = s.Description,
                        TotalCost = s.TotalCost,
                        SearchKeyword = s.SearchKeyword,
                        YoutubeSearchQuery = s.YoutubeSearchQuery,
                        VideoUrl = s.VideoUrl,
                        MaterialsJson = s.MaterialsJson,
                        MatchedProductId = matchedProd?.Id,
                        MatchedProductName = matchedProd?.Name,
                        MatchedProductPrice = matchedProd?.Price,
                        MatchedProductSupportsNfc = matchedProd?.SupportsNfc
                    };
                }).ToList();

                var replyText = !string.IsNullOrWhiteSpace(suggestionResponse.Reply)
                    ? suggestionResponse.Reply
                    : "Tuyệt vời! Dưới đây là các gợi ý tự làm DIY kèm link mua nguyên liệu chuẩn trên Shopee, video hướng dẫn YouTube và sản phẩm handmade có sẵn tại CraftVision 3D để bạn có thể gắn Thiệp 3D NFC và đặt mua ngay:";

                return new GiftChatResponseDto
                {
                    Reply = replyText,
                    Suggestions = giftSuggestions
                };
            }
            catch (Exception ex)
            {
                profile.IsSuccess = false;
                profile.ErrorReason = $"AI Fallback ({ex.GetType().Name}): {ex.Message}";

                await Task.Delay(800, cancellationToken);

                var lowerPrompt = request.Prompt?.ToLowerInvariant().Trim() ?? "";
                var requestedTopicKeywords = ExtractRequestedTopicKeywords(lowerPrompt);

                var costRangeLabel = (minBudget.HasValue && maxBudget.HasValue)
                    ? $"{minBudget.Value:N0}đ - {maxBudget.Value:N0}đ"
                    : (maxBudget.HasValue ? $"20.000đ - {maxBudget.Value:N0}đ" : "25.000đ - 50.000đ");

                var pool = new List<GiftSuggestionDto>
                {
                    new GiftSuggestionDto
                    {
                        Name = "Thú bông / Cún bông kẽm lông nhung handmade",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                        EstimatedCostRange = costRangeLabel,
                        EstimatedTime = "1.5 giờ",
                        Description = "Uốn dây kẽm lông nhung mềm mịn tạo hình cún cưng hoặc gấu bông nhỏ xinh đội vương miện làm móc khóa.",
                        TotalCost = "45.000đ",
                        SearchKeyword = "Set kẽm nhung lông xù làm cún bông",
                        YoutubeSearchQuery = "hướng dẫn làm chó bông bằng kẽm nhung lông xù",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("hướng dẫn làm chó bông bằng kẽm nhung lông xù"),
                        MaterialsJson = "[{\"name\": \"Kẽm lông nhung xù làm thú bông\", \"quantity\": \"1 bó\", \"price\": \"25.000đ\", \"total\": \"25.000đ\", \"shopeeKeyword\": \"kẽm nhung lông xù làm thú bông\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=k%E1%BA%BDm%20nhung%20l%C3%B4ng%20x%C3%B9%20l%C3%A0m%20th%C3%BA%20b%C3%B4ng\"}, {\"name\": \"Set mắt mũi thú bông & phụ kiện vương miện mini\", \"quantity\": \"1 set\", \"price\": \"15.000đ\", \"total\": \"15.000đ\", \"shopeeKeyword\": \"mắt mũi làm thú bông kẽm nhung\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=m%E1%BA%AFt%20m%C5%A9i%20l%C3%A0m%20th%C3%BA%20b%C3%B4ng%20k%E1%BA%BDm%20nhung\"}, {\"name\": \"Khoen móc khóa & keo nến\", \"quantity\": \"1 bộ\", \"price\": \"5.000đ\", \"total\": \"5.000đ\", \"shopeeKeyword\": \"móc khóa càng cua\", \"purchaseUrl\": \"https://shopee.vn/100-M%C3%B3c-kh%C3%B3a-c%C3%A0ng-cua-i.651016585.40600362048\"}]"
                    },
                    new GiftSuggestionDto
                    {
                        Name = "Bó hoa kẽm nhung mini handmade",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                        EstimatedCostRange = costRangeLabel,
                        EstimatedTime = "1.5 giờ",
                        Description = "Uốn dây kẽm nhung nhiều màu sắc thành bó hoa hướng dương hoặc hoa tulip mềm mịn không bao giờ tàn.",
                        TotalCost = "45.000đ",
                        SearchKeyword = "Set nguyên liệu làm hoa kẽm nhung",
                        YoutubeSearchQuery = "cách làm hoa kẽm nhung đơn giản đẹp tại nhà",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("cách làm hoa kẽm nhung đơn giản đẹp tại nhà"),
                        MaterialsJson = "[{\"name\": \"Kẽm nhung loại dày nhiều màu\", \"quantity\": \"1 bó 100 sợi\", \"price\": \"20.000đ\", \"total\": \"20.000đ\", \"shopeeKeyword\": \"kẽm nhung làm hoa 100 sợi\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=k%E1%BA%BDm%20nhung%20l%C3%A0m%20hoa%20100%20s%E1%BB%A3i\"}, {\"name\": \"Giấy gói hoa Hàn Quốc kèm ruy băng\", \"quantity\": \"1 set\", \"price\": \"15.000đ\", \"total\": \"15.000đ\", \"shopeeKeyword\": \"giấy gói hoa kẽm nhung mini\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=gi%E1%BA%A5y%20g%C3%B3i%20hoa%20k%E1%BA%BDm%20nhung%20mini\"}, {\"name\": \"Keo nến và băng keo sáp cuốn cành\", \"quantity\": \"1 bộ\", \"price\": \"10.000đ\", \"total\": \"10.000đ\", \"shopeeKeyword\": \"băng keo sáp cuốn cành hoa\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=b%C4%83ng%20keo%20s%C3%A1p%20cu%E1%BB%91n%20c%C3%A0nh%20hoa\"}]"
                    },
                    new GiftSuggestionDto
                    {
                        Name = "Lọ & Móc khóa Ngôi sao may mắn handmade",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                        EstimatedCostRange = "15.000đ - 35.000đ",
                        EstimatedTime = "1 giờ",
                        Description = "Gấp những ngôi sao giấy lấp lánh kết hợp khoen móc khóa hoặc bỏ lọ thủy tinh gửi gắm lời chúc bình an, may mắn.",
                        TotalCost = "30.000đ",
                        SearchKeyword = "Set giấy gấp ngôi sao may mắn",
                        YoutubeSearchQuery = "cách gấp ngôi sao may mắn làm móc khóa quà tặng",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("cách gấp ngôi sao may mắn làm móc khóa quà tặng"),
                        MaterialsJson = "[{\"name\": \"Giấy gấp sao ánh nhũ pastel (500 tờ)\", \"quantity\": \"1 xấp\", \"price\": \"15.000đ\", \"total\": \"15.000đ\", \"shopeeKeyword\": \"giấy gấp sao may mắn ánh nhũ\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=gi%E1%BA%A5y%20g%E1%BA%A5p%20sao%20may%20m%E1%BA%AFn%20%C3%A1nh%20nh%C5%A9\"}, {\"name\": \"Lọ thủy tinh mini nút bần kèm dây thừng\", \"quantity\": \"1 lọ\", \"price\": \"10.000đ\", \"total\": \"10.000đ\", \"shopeeKeyword\": \"lọ thủy tinh đựng sao may mắn\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=l%E1%BB%8D%20th%E1%BB%A7y%20tinh%20%C4%91%E1%BB%B1ng%20sao%20may%20m%E1%BA%AFn\"}, {\"name\": \"Khoen móc khóa càng cua\", \"quantity\": \"1 cái\", \"price\": \"5.000đ\", \"total\": \"5.000đ\", \"shopeeKeyword\": \"móc khóa càng cua\", \"purchaseUrl\": \"https://shopee.vn/100-M%C3%B3c-kh%C3%B3a-c%C3%A0ng-cua-i.651016585.40600362048\"}]"
                    },
                    new GiftSuggestionDto
                    {
                        Name = "Vòng tay chuỗi hạt cườm & Charm cá nhân hóa",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Easy,
                        EstimatedCostRange = costRangeLabel,
                        EstimatedTime = "1 giờ",
                        Description = "Xỏ hạt cườm pastel kết hợp charm chữ cái tên người nhận cực kỳ xinh xắn.",
                        TotalCost = "45.000đ",
                        SearchKeyword = "Set hạt cườm làm vòng tay",
                        YoutubeSearchQuery = "hướng dẫn xỏ hạt cườm làm vòng tay móc khóa handmade",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("hướng dẫn xỏ hạt cườm làm vòng tay móc khóa handmade"),
                        MaterialsJson = "[{\"name\": \"Set 200 Hạt Cườm Vuông acrylic 4mm\", \"quantity\": \"1 set\", \"price\": \"25.000đ\", \"total\": \"25.000đ\", \"shopeeKeyword\": \"hạt cườm vuông chữ cái làm vòng\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=Set%201100%20h%E1%BA%A1t%20c%C6%B0%E1%BB%9Dm%20acrylic%20nhi%E1%BB%81u%20m%C3%A0u%20ch%E1%BB%AF%20A\"}, {\"name\": \"Charm mix theo tone màu pastel\", \"quantity\": \"1 gói\", \"price\": \"15.000đ\", \"total\": \"15.000đ\", \"shopeeKeyword\": \"charm mix màu làm vòng tay\", \"purchaseUrl\": \"https://shopee.vn/list/c%C3%A2y%20h%E1%BA%A1t%20c%C6%B0%E1%BB%9Dm\"}, {\"name\": \"Dây cước co giãn xỏ vòng\", \"quantity\": \"1 cuộn\", \"price\": \"5.000đ\", \"total\": \"5.000đ\", \"shopeeKeyword\": \"dây cước thun xỏ vòng hạt cườm\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=d%C3%A2y%20c%C6%B0%E1%BB%9Bc%20thun%20x%E1%BB%8F%20v%C3%B2ng%20h%E1%BA%A1t%20c%C6%B0%E1%BB%9Dm\"}]"
                    },
                    new GiftSuggestionDto
                    {
                        Name = "Charm đất sét tự khô nặn hình thú mini",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                        EstimatedCostRange = costRangeLabel,
                        EstimatedTime = "1.5 giờ",
                        Description = "Nặn charm hoặc mô hình mini từ đất sét tự khô và phủ bóng làm móc khóa kỷ niệm.",
                        TotalCost = "45.000đ",
                        SearchKeyword = "Đất sét tự khô làm móc khóa",
                        YoutubeSearchQuery = "hướng dẫn nặn móc khóa bằng đất sét tự khô",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("hướng dẫn nặn móc khóa bằng đất sét tự khô"),
                        MaterialsJson = "[{\"name\": \"Đất Sét Tự Khô Deli Túi 250gr\", \"quantity\": \"1 túi\", \"price\": \"25.000đ\", \"total\": \"25.000đ\", \"shopeeKeyword\": \"đất sét tự khô deli\", \"purchaseUrl\": \"https://shopee.vn/%C4%90%E1%BA%A5t-S%C3%A9t-T%E1%BB%B1-Kh%C3%B4-Deli-%C4%90%E1%BA%A5t-S%C3%A9t-M%E1%BB%B9-Thu%E1%BA%ADt-T%C3%BAi-250-500gr-An-To%C3%A0n-Kh%C3%B4ng-M%C3%B9i-L%C3%A0m-Khu%C3%B4n-N%E1%BA%B7n-H%C3%ACnh-M%E1%BA%ABu-Trang-Tr%C3%AD-%C4%90a-%E1%BB%A8ng-D%E1%BB%A5ng-i.1021392906.29968013560\"}, {\"name\": \"Bộ màu Acrylic mini kèm cọ\", \"quantity\": \"1 bộ\", \"price\": \"15.000đ\", \"total\": \"15.000đ\", \"shopeeKeyword\": \"màu acrylic tô đất sét\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=m%C3%A0u%20acrylic%2012%20m%C3%A0u%20t%C3%B4%20%C4%91%E1%BA%A5t%20s%C3%A9t\"}, {\"name\": \"Khoen móc khóa càng cua\", \"quantity\": \"1 cái\", \"price\": \"5.000đ\", \"total\": \"5.000đ\", \"shopeeKeyword\": \"móc khóa càng cua\", \"purchaseUrl\": \"https://shopee.vn/100-M%C3%B3c-kh%C3%B3a-c%C3%A0ng-cua-i.651016585.40600362048\"}]"
                    },
                    new GiftSuggestionDto
                    {
                        Name = "Móc khóa len hình thú Amigurumi đáng yêu",
                        Difficulty = CraftVision.Domain.Enums.Difficulty.Medium,
                        EstimatedCostRange = costRangeLabel,
                        EstimatedTime = "2 giờ",
                        Description = "Tự tay móc hoặc chọc len tạo hình thú cưng nhỏ gọn để treo balo, chìa khóa tặng bạn bè.",
                        TotalCost = "45.000đ",
                        SearchKeyword = "Set làm móc khóa len hình thú",
                        YoutubeSearchQuery = "hướng dẫn móc len thú bông amigurumi cho người mới",
                        VideoUrl = "https://www.youtube.com/results?search_query=" + Uri.EscapeDataString("hướng dẫn móc len thú bông amigurumi cho người mới"),
                        MaterialsJson = "[{\"name\": \"Len Milk Cotton 125g\", \"quantity\": \"1 cuộn\", \"price\": \"22.000đ\", \"total\": \"22.000đ\", \"shopeeKeyword\": \"len milk cotton 125g\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=len%20milk%20cotton%20125g\"}, {\"name\": \"Bông gòn bi loại 1 nhồi thú\", \"quantity\": \"1 gói\", \"price\": \"18.000đ\", \"total\": \"18.000đ\", \"shopeeKeyword\": \"bông gòn bi nhồi thú handmade\", \"purchaseUrl\": \"https://shopee.vn/search?keyword=len%20milk%20cotton\"}, {\"name\": \"Khoen móc khóa càng cua\", \"quantity\": \"1 cái\", \"price\": \"5.000đ\", \"total\": \"5.000đ\", \"shopeeKeyword\": \"móc khóa càng cua\", \"purchaseUrl\": \"https://shopee.vn/100-M%C3%B3c-kh%C3%B3a-c%C3%A0ng-cua-i.651016585.40600362048\"}]"
                    }
                };

                List<GiftSuggestionDto> selectedIdeas;
                if (requestedTopicKeywords.Any())
                {
                    selectedIdeas = pool
                        .Where(item => requestedTopicKeywords.Any(kw =>
                            item.Name.Contains(kw, StringComparison.OrdinalIgnoreCase) ||
                            (item.Description != null && item.Description.Contains(kw, StringComparison.OrdinalIgnoreCase))))
                        .ToList();

                    if (!selectedIdeas.Any())
                    {
                        selectedIdeas = pool.Take(3).ToList();
                    }
                }
                else
                {
                    selectedIdeas = pool.Take(3).ToList();
                }

                for (int i = 0; i < selectedIdeas.Count; i++)
                {
                    selectedIdeas[i].Id = Guid.NewGuid();
                    if (candidateProducts.Any())
                    {
                        var matchedProd = FindBestMatchingProduct(
                            null,
                            null,
                            selectedIdeas[i].Name,
                            selectedIdeas[i].Description,
                            candidateProducts,
                            i);

                        if (matchedProd != null)
                        {
                            selectedIdeas[i].MatchedProductId = matchedProd.Id;
                            selectedIdeas[i].MatchedProductName = matchedProd.Name;
                            selectedIdeas[i].MatchedProductPrice = matchedProd.Price;
                            selectedIdeas[i].MatchedProductSupportsNfc = matchedProd.SupportsNfc;
                        }
                    }
                }

                var dbProductSummary = candidateProducts.Any()
                    ? string.Join(", ", candidateProducts.Take(4).Select(p => $"{p.Name} ({p.Price:N0}đ)"))
                    : "Ngôi sao may mắn (15.000đ), Hoa kẽm nhung (25.000đ), Móc khóa len (30.000đ)";

                return new GiftChatResponseDto
                {
                    Reply = $"Dựa trên yêu cầu và ngân sách của bạn, mình gợi ý các phương án tự làm (DIY) đúng chủ đề kèm link mua nguyên liệu chuẩn trên Shopee và link tìm video hướng dẫn trên YouTube bên dưới nhé!\n\n💡 Đặc biệt, nếu bạn muốn mua quà làm sẵn đúng tầm giá và có gắn Thiệp 3D thông minh quét NFC tại CraftVision 3D (như: {dbProductSummary}), bạn chỉ cần:\n1. Bấm vào nút '🎁 Mua sẵn & Gắn thiệp NFC' ngay bên dưới mỗi gợi ý.\n2. Chọn mẫu thiệp 3D và nhờ AI viết lời chúc cá nhân hóa gắn vào chip NFC của món quà.\n3. Bấm 'Thanh toán ngay' để hoàn tất đơn hàng!",
                    Suggestions = selectedIdeas
                };
            }
            finally
            {
                totalSw.Stop();
                profile.TotalTimeMs = totalSw.ElapsedMilliseconds;
                _profiler.Log(profile);
            }
        }

        private static Product? FindBestMatchingProduct(
            Guid? matchedProductId,
            string? matchedProductName,
            string? suggestionName,
            string? suggestionDesc,
            List<Product> candidateProducts,
            int index)
        {
            if (!candidateProducts.Any())
            {
                return null;
            }

            if (matchedProductId.HasValue)
            {
                var byId = candidateProducts.FirstOrDefault(p => p.Id == matchedProductId.Value);
                if (byId != null) return byId;
            }

            var combinedText = $"{matchedProductName} {suggestionName} {suggestionDesc}".ToLowerInvariant();

            // Match by specific craft category keywords (avoiding generic stop-words like "móc", "khóa", "mô", "hình")
            if (combinedText.Contains("kẽm lông") || combinedText.Contains("lông xù") || combinedText.Contains("cún") || combinedText.Contains("chó") || combinedText.Contains("động vật"))
            {
                var animalProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("động vật", StringComparison.OrdinalIgnoreCase))
                    ?? candidateProducts.FirstOrDefault(p => p.Name.Contains("Gấu bông", StringComparison.OrdinalIgnoreCase));
                if (animalProd != null) return animalProd;
            }

            if (combinedText.Contains("gấu bông") || combinedText.Contains("thú bông"))
            {
                var plushProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("Gấu bông", StringComparison.OrdinalIgnoreCase))
                    ?? candidateProducts.FirstOrDefault(p => p.Name.Contains("động vật", StringComparison.OrdinalIgnoreCase));
                if (plushProd != null) return plushProd;
            }

            if (combinedText.Contains("len") || combinedText.Contains("amigurumi"))
            {
                var woolProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("len", StringComparison.OrdinalIgnoreCase))
                    ?? candidateProducts.FirstOrDefault(p => p.Name.Contains("Gấu bông", StringComparison.OrdinalIgnoreCase));
                if (woolProd != null) return woolProd;
            }

            if (combinedText.Contains("hoa") || (combinedText.Contains("kẽm nhung") && !combinedText.Contains("thú") && !combinedText.Contains("cún")))
            {
                var flowerProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("Hoa", StringComparison.OrdinalIgnoreCase));
                if (flowerProd != null) return flowerProd;
            }

            if (combinedText.Contains("ngôi sao") || combinedText.Contains("sao may mắn") || combinedText.Contains("gấp sao"))
            {
                var starProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("Ngôi sao", StringComparison.OrdinalIgnoreCase));
                if (starProd != null) return starProd;
            }

            if (combinedText.Contains("cỏ may mắn") || combinedText.Contains("cỏ 4 lá") || combinedText.Contains("cỏ bốn lá"))
            {
                var cloverProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("Cỏ may mắn", StringComparison.OrdinalIgnoreCase));
                if (cloverProd != null) return cloverProd;
            }

            if (combinedText.Contains("hạt nhựa") || combinedText.Contains("nhựa ủi") || combinedText.Contains("pixel"))
            {
                var beadProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("hạt nhựa", StringComparison.OrdinalIgnoreCase))
                    ?? candidateProducts.FirstOrDefault(p => p.Name.Contains("lộn xộn", StringComparison.OrdinalIgnoreCase));
                if (beadProd != null) return beadProd;
            }

            if (combinedText.Contains("lego") || combinedText.Contains("lắp ráp"))
            {
                var legoProd = candidateProducts.FirstOrDefault(p => p.Name.Contains("Lego", StringComparison.OrdinalIgnoreCase));
                if (legoProd != null) return legoProd;
            }

            if (!string.IsNullOrWhiteSpace(matchedProductName))
            {
                var byName = candidateProducts.FirstOrDefault(p =>
                    p.Name.Equals(matchedProductName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                    p.Name.Contains(matchedProductName.Trim(), StringComparison.OrdinalIgnoreCase));
                if (byName != null) return byName;
            }

            return candidateProducts[index % candidateProducts.Count];
        }

        private static List<string> ExtractRequestedTopicKeywords(string? prompt)
        {
            var result = new List<string>();
            if (string.IsNullOrWhiteSpace(prompt))
            {
                return result;
            }

            var text = prompt.ToLowerInvariant();

            if (text.Contains("hoa") || text.Contains("tulip") || text.Contains("hướng dương"))
            {
                result.Add("hoa");
                result.Add("kẽm nhung");
            }
            if (text.Contains("ngôi sao") || text.Contains("sao may mắn") || text.Contains("lọ sao") || text.Contains("gấp sao") || text.Contains("cỏ may mắn"))
            {
                result.Add("ngôi sao");
                result.Add("may mắn");
            }
            if (text.Contains("vòng tay") || text.Contains("hạt cườm") || text.Contains("lắc tay") || text.Contains("xỏ hạt") || text.Contains("dây chuyền"))
            {
                result.Add("vòng tay");
                result.Add("hạt cườm");
            }
            if (text.Contains("đất sét") || text.Contains("charm đất sét") || text.Contains("nặn"))
            {
                result.Add("đất sét");
                result.Add("charm");
            }
            if (text.Contains("len") || text.Contains("amigurumi") || text.Contains("móc len") || text.Contains("gấu bông") || text.Contains("thú bông") || text.Contains("cún") || text.Contains("chó") || text.Contains("kẽm lông") || text.Contains("động vật"))
            {
                result.Add("len");
                result.Add("thú");
                result.Add("gấu");
                result.Add("cún");
                result.Add("kẽm");
            }
            if (text.Contains("lego") || text.Contains("lắp ráp"))
            {
                result.Add("lego");
            }
            if (text.Contains("hạt nhựa ủi") || text.Contains("pixel"))
            {
                result.Add("hạt nhựa");
            }

            return result.Distinct().ToList();
        }

        private static void TryExtractBudgetFromPrompt(string? prompt, decimal? explicitMaxCost, out decimal? minBudget, out decimal? maxBudget)
        {
            minBudget = null;
            maxBudget = explicitMaxCost;

            if (string.IsNullOrWhiteSpace(prompt))
            {
                return;
            }

            var text = prompt.ToLowerInvariant();

            // Match ranges like "30k - 60k", "30k-60k", "30 - 60k", "30.000 - 60.000đ", "từ 30k đến 60k"
            var rangeMatch = System.Text.RegularExpressions.Regex.Match(
                text,
                @"(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|đ|vnđ|vnd)?\s*(?:-|~|đến|tới|to)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|đ|vnđ|vnd)?");

            if (rangeMatch.Success)
            {
                var unit1 = rangeMatch.Groups[2].Value;
                var unit2 = rangeMatch.Groups[4].Value;
                var effectiveUnit = !string.IsNullOrEmpty(unit2) ? unit2 : unit1;

                var val1 = NormalizeBudgetAmount(rangeMatch.Groups[1].Value, string.IsNullOrEmpty(unit1) ? effectiveUnit : unit1);
                var val2 = NormalizeBudgetAmount(rangeMatch.Groups[3].Value, string.IsNullOrEmpty(unit2) ? effectiveUnit : unit2);

                if (val1.HasValue && val2.HasValue && val2.Value >= val1.Value && val2.Value >= 10_000)
                {
                    minBudget = val1.Value;
                    maxBudget = val2.Value;
                    return;
                }
            }

            // Match single budget expressions like "dưới 50k", "tầm 60k", "khoảng 40 nghìn", "50k"
            var singleMatch = System.Text.RegularExpressions.Regex.Match(
                text,
                @"(?:dưới|tầm|khoảng|tối đa|ngân sách|giá|cỡ)?\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngàn|đ|vnđ|vnd)\b");

            if (singleMatch.Success)
            {
                var singleVal = NormalizeBudgetAmount(singleMatch.Groups[1].Value, singleMatch.Groups[2].Value);
                if (singleVal.HasValue && singleVal.Value >= 10_000)
                {
                    maxBudget = singleVal.Value;
                }
            }
        }

        private static decimal? NormalizeBudgetAmount(string rawNum, string unit)
        {
            if (string.IsNullOrWhiteSpace(rawNum))
            {
                return null;
            }

            // Handle Vietnamese thousand separator like "30.000" or "60,000"
            var cleaned = rawNum.Trim();
            if (System.Text.RegularExpressions.Regex.IsMatch(cleaned, @"^\d{1,3}([.,]\d{3})+$"))
            {
                cleaned = cleaned.Replace(".", "").Replace(",", "");
                if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var exactVal))
                {
                    return exactVal;
                }
            }

            cleaned = cleaned.Replace(",", ".");
            if (!decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var num))
            {
                return null;
            }

            if (unit is "k" or "nghìn" or "ngàn" || (num < 1000 && !string.IsNullOrEmpty(unit)))
            {
                return num * 1000m;
            }

            return num < 1000 ? num * 1000m : num;
        }
    }
}
