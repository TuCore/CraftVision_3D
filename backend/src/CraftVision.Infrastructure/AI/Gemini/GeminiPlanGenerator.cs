using System.Net.Http.Json;
using System.Text.Json;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.AI.Gemini.Models;
using CraftVision.Infrastructure.AI.Gemini.Prompts;

namespace CraftVision.Infrastructure.AI.Gemini
{
    public class GeminiPlanGenerator : IAiPlanGenerator
    {
        private readonly HttpClient _geminiClient;

        public GeminiPlanGenerator(HttpClient geminiClient)
        {
            _geminiClient = geminiClient;
        }

        public async Task<DiyPlan> GenerateDetailedPlanAsync(string intent, GiftSuggestion chosenSuggestion, string retrievedContext)
        {
            var systemPrompt = PlanPromptTemplate.SystemPrompt;
            var userPrompt = PlanPromptTemplate.BuildUserPrompt(chosenSuggestion.Name, intent, retrievedContext);
            
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
                        type = "object",
                        properties = new
                        {
                            title = new { type = "string" },
                            occasion = new { type = "string" },
                            difficulty = new { type = "string", @enum = new[] { "Easy", "Medium", "Hard" } },
                            estimatedMinutes = new { type = "integer" },
                            estimatedCost = new { type = "number" },
                            materials = new { type = "array", items = new { type = "object" } },
                            tutorials = new { type = "array", items = new { type = "object" } },
                            stepsJson = new { type = "array", items = new { type = "object" } }
                        },
                        required = new[] { "title", "difficulty", "materials", "stepsJson" }
                    }
                }
            };

            var apiResponse = await _geminiClient.PostAsJsonAsync("models/gemini-1.5-flash:generateContent", requestPayload);
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
                var dto = JsonSerializer.Deserialize<GeminiPlanResponseDto>(jsonText);
                if (dto == null) throw new Exception("Deserialized plan is null.");

                return new DiyPlan
                {
                    Id = Guid.NewGuid(),
                    Title = dto.Title,
                    Occasion = dto.Occasion,
                    Difficulty = Enum.TryParse<Difficulty>(dto.Difficulty, true, out var parsedDiff) ? parsedDiff : Difficulty.Medium,
                    EstimatedMinutes = dto.EstimatedMinutes,
                    EstimatedCost = dto.EstimatedCost,
                    MaterialsJson = JsonSerializer.Serialize(dto.Materials ?? new List<object>()),
                    StepsJson = JsonSerializer.Serialize(dto.StepsJson ?? new List<object>())
                };
            }
            catch (JsonException ex)
            {
                throw new Exception("Failed to parse JSON response from Gemini. Schema was likely violated.", ex);
            }
        }
    }
}
