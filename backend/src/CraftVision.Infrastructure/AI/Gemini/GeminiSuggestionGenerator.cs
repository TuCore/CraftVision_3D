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

        public async Task<List<GiftSuggestion>> GenerateSuggestionsAsync(string intent, string retrievedContext)
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
                    ResponseMimeType = "application/json",
                    ResponseSchema = new
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
                                videoUrl = new { type = "string" },
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
                                            purchaseUrl = new { type = "string" }
                                        }
                                    }
                                }
                            },
                            required = new[] { "name", "difficulty", "description", "materials" }
                        }
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

            try
            {
                var dtos = JsonSerializer.Deserialize<List<GeminiSuggestionResponseDto>>(jsonText);
                if (dtos == null) return new List<GiftSuggestion>();

                return dtos.Select(dto => new GiftSuggestion
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    Difficulty = Enum.TryParse<Difficulty>(dto.Difficulty, true, out var parsedDiff) ? parsedDiff : Difficulty.Medium,
                    EstimatedCostRange = dto.EstimatedCostRange,
                    EstimatedTime = dto.EstimatedTime,
                    Description = dto.Description,
                    TotalCost = dto.TotalCost,
                    SearchKeyword = dto.SearchKeyword,
                    VideoUrl = dto.VideoUrl,
                    MaterialsJson = dto.Materials != null ? JsonSerializer.Serialize(dto.Materials) : null
                }).ToList();
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse JSON response from Gemini. Schema was likely violated.", ex);
            }
        }
    }
}
