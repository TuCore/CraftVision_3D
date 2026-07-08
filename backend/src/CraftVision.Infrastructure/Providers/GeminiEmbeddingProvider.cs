using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CraftVision.Application.Interfaces.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Providers
{
    public class GeminiEmbeddingProvider : IEmbeddingProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiEmbeddingProvider> _logger;

        public GeminiEmbeddingProvider(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiEmbeddingProvider> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            var apiKey = _configuration["AiSettings:Gemini:ApiKey"];
            var model = _configuration["AiSettings:Gemini:EmbeddingModel"] ?? "gemini-embedding-2";

            if (string.IsNullOrEmpty(apiKey) || apiKey == "REPLACE_GEMINI_API_KEY")
            {
                _logger.LogWarning("Gemini API Key is not configured. Returning dummy embedding vector.");
                return Enumerable.Repeat(0.01f, 768).ToArray();
            }

            var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={apiKey}";

            var requestBody = new
            {
                model = $"models/{model}",
                content = new
                {
                    parts = new[] { new { text = text } }
                }
            };

            try
            {
                var response = await _httpClient.PostAsJsonAsync(requestUrl, requestBody);
                response.EnsureSuccessStatusCode();

                var responseData = await response.Content.ReadFromJsonAsync<GeminiEmbeddingResponse>();
                var values = responseData?.Embedding?.Values ?? Array.Empty<float>();
                
                // Ensure dimensions match DB to avoid PostgreSQL pgvector 2000-dim limit
                int targetDim = int.TryParse(_configuration["AiSettings:Gemini:EmbeddingDimensions"], out int d) ? d : 768;
                if (values.Length > targetDim)
                {
                    values = values.Take(targetDim).ToArray();
                }
                return values;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating embedding from Gemini API.");
                throw;
            }
        }

        private class GeminiEmbeddingResponse
        {
            [JsonPropertyName("embedding")]
            public GeminiEmbeddingData? Embedding { get; set; }
        }

        private class GeminiEmbeddingData
        {
            [JsonPropertyName("values")]
            public float[]? Values { get; set; }
        }
    }
}
