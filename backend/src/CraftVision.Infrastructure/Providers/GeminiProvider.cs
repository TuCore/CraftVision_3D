using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Linq;

namespace CraftVision.Infrastructure.Providers;

public class GeminiProvider : ILLMProvider
{
    private readonly HttpClient _httpClient;
    private readonly AiModelOptions _options;
    private readonly ILogger<GeminiProvider> _logger;

    public GeminiProvider(HttpClient httpClient, IOptions<AiModelOptions> options, ILogger<GeminiProvider> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> GenerateResponseAsync(List<PromptMessage> messages)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={_options.ApiKey}";

        // Convert PromptMessages to Gemini format
        var contents = new List<object>();

        var systemMessages = messages.Where(m => m.Role == "System").Select(m => m.Content).ToList();
        var userMessages = messages.Where(m => m.Role == "User").Select(m => m.Content).ToList();

        // Gemini uses "system_instruction" for system prompt, but for simplicity we can just combine it into the user prompt or use the new API format.
        // Format: { "contents": [ { "role": "user", "parts": [ { "text": "..." } ] } ] }
        
        var combinedPrompt = string.Join("\n\n", systemMessages) + "\n\n" + string.Join("\n\n", userMessages);

        var requestBody = new
        {
            contents = new[]
            {
                new 
                {
                    role = "user",
                    parts = new[] { new { text = combinedPrompt } }
                }
            },
            generationConfig = new
            {
                maxOutputTokens = _options.MaxOutputTokens,
                temperature = 0.7
            }
        };

        var jsonBody = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("Gemini API Error: {StatusCode} - {Error}", response.StatusCode, errorBody);
            throw new System.Exception($"Failed to call Gemini API: {response.StatusCode}");
        }

        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseString);
        
        var root = jsonDoc.RootElement;
        
        try
        {
            var text = root.GetProperty("candidates")[0]
                           .GetProperty("content")
                           .GetProperty("parts")[0]
                           .GetProperty("text")
                           .GetString();
            return text ?? string.Empty;
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Gemini response: {Response}", responseString);
            throw new System.Exception("Invalid response format from Gemini");
        }
    }
}
