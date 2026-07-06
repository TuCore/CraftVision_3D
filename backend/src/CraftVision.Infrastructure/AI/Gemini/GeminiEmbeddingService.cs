using System.Net.Http.Json;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Infrastructure.AI.Gemini.Models;

namespace CraftVision.Infrastructure.AI.Gemini
{
    public class GeminiEmbeddingService : IEmbeddingService
    {
        private readonly HttpClient _geminiClient;

        public GeminiEmbeddingService(HttpClient geminiClient)
        {
            _geminiClient = geminiClient;
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text)
        {
            var requestPayload = new GeminiEmbedContentRequest
            {
                Model = "models/gemini-embedding-001",
                Content = new GeminiContent
                {
                    Parts = new List<GeminiPart>
                    {
                        new GeminiPart { Text = text }
                    }
                },
                OutputDimensionality = 1536 // Match PostgreSQL configuration
            };

            var apiResponse = await _geminiClient.PostAsJsonAsync("models/gemini-embedding-001:embedContent", requestPayload);
            apiResponse.EnsureSuccessStatusCode();

            var responseData = await apiResponse.Content.ReadFromJsonAsync<GeminiEmbedContentResponse>();
            
            if (responseData?.Embedding?.Values == null || responseData.Embedding.Values.Count == 0)
            {
                throw new Exception("Gemini embedding returned empty or invalid values.");
            }

            return responseData.Embedding.Values.ToArray();
        }
    }
}
