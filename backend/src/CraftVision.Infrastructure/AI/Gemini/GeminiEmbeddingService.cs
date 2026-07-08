using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CraftVision.Application.Interfaces.AI;

namespace CraftVision.Infrastructure.AI.Gemini
{
    public class GeminiEmbeddingService : IEmbeddingService
    {
        private readonly HttpClient _geminiClient;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public GeminiEmbeddingService(HttpClient geminiClient, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _geminiClient = geminiClient;
            _configuration = configuration;
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            var modelName = _configuration["AiSettings:Gemini:EmbeddingModel"] ?? "text-embedding-005";

            // Build a minimal, clean JSON payload manually to avoid
            // sending extra fields (role, inlineData, outputDimensionality)
            // that the Embedding API rejects with 400 Bad Request.
            var requestJson = JsonSerializer.Serialize(new
            {
                model = $"models/{modelName}",
                content = new
                {
                    parts = new[] { new { text = text } }
                },
                outputDimensionality = 768
            });

            var httpContent = new StringContent(requestJson, Encoding.UTF8, "application/json");
            var apiResponse = await _geminiClient.PostAsync(
                $"models/{modelName}:embedContent",
                httpContent);

            if (!apiResponse.IsSuccessStatusCode)
            {
                var errorBody = await apiResponse.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Gemini Embedding API returned {(int)apiResponse.StatusCode}: {errorBody}");
            }

            var responseData = await apiResponse.Content.ReadFromJsonAsync<EmbedResponse>();

            if (responseData?.Embedding?.Values == null || responseData.Embedding.Values.Length == 0)
            {
                throw new Exception("Gemini embedding returned empty or invalid values.");
            }

            return responseData.Embedding.Values;
        }

        // Minimal response DTOs – only what we need
        private class EmbedResponse
        {
            [JsonPropertyName("embedding")]
            public EmbedValues? Embedding { get; set; }
        }

        private class EmbedValues
        {
            [JsonPropertyName("values")]
            public float[]? Values { get; set; }
        }
    }
}
