using System.Net.Http.Json;
using CraftVision.Application.Interfaces.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Providers
{
    public class GeminiChatProvider : IAiChatProvider
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiChatProvider> _logger;

        public GeminiChatProvider(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiChatProvider> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AiChatResponse> GenerateChatResponseAsync(string systemPrompt, IEnumerable<(string Role, string Content)> chatHistory, string userMessage)
        {
            var apiKey = _configuration["AiSettings:Gemini:ApiKey"];
            var model = _configuration["AiSettings:Gemini:ChatVisionModel"] ?? "gemini-1.5-flash";

            if (string.IsNullOrEmpty(apiKey) || apiKey == "REPLACE_GEMINI_API_KEY")
            {
                _logger.LogWarning("Gemini API Key is missing. Returning fallback message.");
                return new AiChatResponse("Đây là tin nhắn trả lời tự động do chưa cấu hình API Key của Gemini.", "MOCK");
            }

            var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var contents = new List<object>();

            if (!string.IsNullOrWhiteSpace(systemPrompt))
            {
                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = $"System Instruction: {systemPrompt}" } }
                });
                contents.Add(new
                {
                    role = "model",
                    parts = new[] { new { text = "Understood." } }
                });
            }

            foreach (var msg in chatHistory)
            {
                contents.Add(new
                {
                    role = msg.Role.ToLower() == "assistant" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }

            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });

            var requestBody = new
            {
                contents = contents,
                generationConfig = new
                {
                    temperature = 0.2
                }
            };

            var response = await _httpClient.PostAsJsonAsync(requestUrl, requestBody);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorString = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API Error: {Error}", errorString);
                throw new Exception($"Gemini API failed with status {response.StatusCode}: {errorString}");
            }

            var responseData = await response.Content.ReadFromJsonAsync<GeminiChatResponse>();
            
            var candidate = responseData?.Candidates?.FirstOrDefault();
            var responseText = candidate?.Content?.Parts?.FirstOrDefault()?.Text ?? "Xin lỗi, tôi không thể trả lời lúc này.";
            var finishReason = candidate?.FinishReason ?? "UNKNOWN";
            
            return new AiChatResponse(responseText, finishReason);
        }

        private class GeminiChatResponse
        {
            public List<GeminiCandidate>? Candidates { get; set; }
        }

        private class GeminiCandidate
        {
            public GeminiContent? Content { get; set; }
            public string? FinishReason { get; set; }
        }

        private class GeminiContent
        {
            public List<GeminiPart>? Parts { get; set; }
        }

        private class GeminiPart
        {
            public string? Text { get; set; }
        }
    }
}
