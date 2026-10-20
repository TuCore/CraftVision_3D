using System.Net.Http.Json;
using System.Text.Json;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.AI.Gemini.Models;
using CraftVision.Infrastructure.AI.Gemini.Prompts;

namespace CraftVision.Infrastructure.AI.Gemini
{
    public class GeminiSuggestionGenerator : IAiSuggestionGenerator
    {
        private readonly HttpClient _geminiClient;

        public GeminiSuggestionGenerator(HttpClient geminiClient)
        {
            _geminiClient = geminiClient;
        }

        public async Task<AiSuggestionResponse> GenerateSuggestionsAsync(string intent, string retrievedContext)
        {
            var systemPrompt = SuggestionPromptTemplate.SystemPrompt;
            var userPrompt = SuggestionPromptTemplate.BuildUserPrompt(intent, retrievedContext);
            
            var requestPayload = new GeminiGenerateContentRequest
            {
                SystemInstruction = new GeminiSystemInstruction
                {
                    Parts = new List<GeminiPart> { new GeminiPart { Text = systemPrompt } }
                },
                Contents = new List<GeminiContent>
                {
                    new GeminiContent
                    {
                        Parts = new List<GeminiPart> { new GeminiPart { Text = userPrompt } }
                    }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    Temperature = 0.3f,
                    MaxOutputTokens = 8192,
                    ThinkingConfig = new GeminiThinkingConfig { ThinkingBudget = 0 },
                    ResponseMimeType = "application/json",
                    ResponseSchema = new
                    {
                        type = "object",
                        properties = new
                        {
                            reply = new { type = "string" },
                            suggestions = new
                            {
                                type = "array",
                                items = new
                                {
                                    type = "object",
                                    properties = new
                                    {
                                        name = new { type = "string" },
                                        difficulty = new { type = "string", @enum = new[] { "Easy", "Medium", "Hard" } },
                                        estimatedCostRange = new { type = "string" },
                                        estimatedTime = new { type = "string" },
                                        description = new { type = "string" },
                                        totalCost = new { type = "string" },
                                        searchKeyword = new { type = "string" },
                                        youtubeSearchQuery = new { type = "string" },
                                        videoUrl = new { type = "string" },
                                        matchedProductId = new { type = "string" },
                                        matchedProductName = new { type = "string" },
                                        materials = new
                                        {
                                            type = "array",
                                            items = new
                                            {
                                                type = "object",
                                                properties = new
                                                {
                                                    name = new { type = "string" },
                                                    quantity = new { type = "string" },
                                                    price = new { type = "string" },
                                                    total = new { type = "string" },
                                                    shopeeKeyword = new { type = "string" },
                                                    purchaseUrl = new { type = "string" }
                                                },
                                                required = new[] { "name", "quantity", "price", "total", "shopeeKeyword", "purchaseUrl" }
                                            }
                                        }
                                    },
                                    required = new[] { "name", "difficulty", "description", "youtubeSearchQuery", "materials" }
                                }
                            }
                        },
                        required = new[] { "reply", "suggestions" }
                    }
                }
            };

            var jsonOptions = new System.Text.Json.JsonSerializerOptions
            {
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };
            var apiResponse = await _geminiClient.PostAsJsonAsync("models/gemini-2.5-flash:generateContent", requestPayload, jsonOptions);
            apiResponse.EnsureSuccessStatusCode();

            var responseData = await apiResponse.Content.ReadFromJsonAsync<GeminiGenerateContentResponse>();
            
            var candidate = responseData?.Candidates?.FirstOrDefault();
            if (candidate == null)
            {
                throw new Exception("No candidates returned from Gemini API.");
            }

            if (candidate.FinishReason == "SAFETY")
            {
                throw new Exception("Gemini blocked the response due to safety settings.");
            }

            var jsonText = candidate.Content?.Parts?.FirstOrDefault()?.Text;
            if (string.IsNullOrWhiteSpace(jsonText))
            {
                throw new Exception("Gemini returned empty text content.");
            }

            jsonText = jsonText.Trim();
            if (jsonText.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                jsonText = jsonText.Substring(7);
            }
            else if (jsonText.StartsWith("```"))
            {
                jsonText = jsonText.Substring(3);
            }
            if (jsonText.EndsWith("```"))
            {
                jsonText = jsonText.Substring(0, jsonText.Length - 3);
            }
            jsonText = jsonText.Trim();

            try
            {
                var envelope = JsonSerializer.Deserialize<GeminiChatEnvelopeDto>(jsonText);
                if (envelope == null || envelope.Suggestions == null)
                {
                    return new AiSuggestionResponse(string.Empty, new List<GiftSuggestion>(), candidate.FinishReason ?? "UNKNOWN");
                }

                var list = envelope.Suggestions.Select(dto =>
                {
                    if (dto.Materials != null)
                    {
                        foreach (var mat in dto.Materials)
                        {
                            var keyword = !string.IsNullOrWhiteSpace(mat.ShopeeKeyword) ? mat.ShopeeKeyword : mat.Name;
                            if (string.IsNullOrWhiteSpace(mat.PurchaseUrl) ||
                                mat.PurchaseUrl.Trim().Equals("https://shopee.vn", StringComparison.OrdinalIgnoreCase) ||
                                mat.PurchaseUrl.Trim().Equals("https://shopee.vn/", StringComparison.OrdinalIgnoreCase))
                            {
                                mat.PurchaseUrl = $"https://shopee.vn/search?keyword={Uri.EscapeDataString(keyword)}";
                            }
                        }
                    }

                    var ytQuery = !string.IsNullOrWhiteSpace(dto.YoutubeSearchQuery)
                        ? dto.YoutubeSearchQuery
                        : $"hướng dẫn cách làm {dto.Name} handmade";
                    var youtubeSearchUrl = $"https://www.youtube.com/results?search_query={Uri.EscapeDataString(ytQuery)}";

                    Guid? parsedProductId = null;
                    if (Guid.TryParse(dto.MatchedProductId, out var pid))
                    {
                        parsedProductId = pid;
                    }

                    return new GiftSuggestion
                    {
                        Id = Guid.NewGuid(),
                        Name = dto.Name,
                        Difficulty = Enum.TryParse<Difficulty>(dto.Difficulty, true, out var parsedDiff) ? parsedDiff : Difficulty.Medium,
                        EstimatedCostRange = dto.EstimatedCostRange,
                        EstimatedTime = dto.EstimatedTime,
                        Description = dto.Description,
                        TotalCost = dto.TotalCost,
                        SearchKeyword = dto.SearchKeyword,
                        YoutubeSearchQuery = ytQuery,
                        VideoUrl = youtubeSearchUrl,
                        MatchedProductId = parsedProductId,
                        MatchedProductName = dto.MatchedProductName,
                        MaterialsJson = dto.Materials != null ? JsonSerializer.Serialize(dto.Materials) : null
                    };
                }).ToList();

                return new AiSuggestionResponse(envelope.Reply, list, candidate.FinishReason ?? "UNKNOWN");
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse JSON response from Gemini. Schema was likely violated.", ex);
            }
        }
    }
}
