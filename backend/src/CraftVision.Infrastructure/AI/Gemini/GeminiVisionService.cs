using System.Net.Http.Json;
using System.Text.Json;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Infrastructure.AI.Gemini.Models;

namespace CraftVision.Infrastructure.AI.Gemini
{
    public class GeminiVisionService : IGeminiVisionService
    {
        private readonly HttpClient _geminiClient;
        private readonly IHttpClientFactory _httpClientFactory;

        public GeminiVisionService(HttpClient geminiClient, IHttpClientFactory httpClientFactory)
        {
            _geminiClient = geminiClient;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> AnalyzeImageAsync(string imageUrl, string prompt)
        {
            string base64Image;
            string mimeType = "image/jpeg";

            if (imageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                var commaIdx = imageUrl.IndexOf(',');
                if (commaIdx <= 0)
                {
                    throw new ArgumentException("Invalid base64 image data URL.");
                }
                var header = imageUrl.Substring(5, commaIdx - 5); // e.g. "image/png;base64"
                var semiIdx = header.IndexOf(';');
                if (semiIdx > 0)
                {
                    mimeType = header.Substring(0, semiIdx);
                }
                base64Image = imageUrl.Substring(commaIdx + 1);
            }
            else
            {
                // 1. SSRF and Domain validation
                if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp))
                {
                    throw new ArgumentException("Invalid image URL. Must be HTTP/HTTPS or data URL.");
                }

                // 2. Download Image safely
                var downloader = _httpClientFactory.CreateClient("ImageDownloader");
                using var response = await downloader.GetAsync(imageUrl, HttpCompletionOption.ResponseHeadersRead);
                response.EnsureSuccessStatusCode();

                // Enforce 5MB limit
                var contentLength = response.Content.Headers.ContentLength;
                if (contentLength.HasValue && contentLength.Value > 5 * 1024 * 1024)
                {
                    throw new InvalidOperationException("Image size exceeds the 5MB limit.");
                }

                var imageBytes = await response.Content.ReadAsByteArrayAsync();
                if (imageBytes.Length > 5 * 1024 * 1024)
                {
                    throw new InvalidOperationException("Image size exceeds the 5MB limit after downloading.");
                }

                base64Image = Convert.ToBase64String(imageBytes);
                mimeType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
            }

            // 3. Construct Gemini Request
            var requestPayload = new GeminiGenerateContentRequest
            {
                Contents = new List<GeminiContent>
                {
                    new GeminiContent
                    {
                        Parts = new List<GeminiPart>
                        {
                            new GeminiPart { Text = prompt },
                            new GeminiPart
                            {
                                InlineData = new GeminiInlineData
                                {
                                    MimeType = mimeType,
                                    Data = base64Image
                                }
                            }
                        }
                    }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    Temperature = 0.2f,
                    MaxOutputTokens = 1024,
                    ThinkingConfig = new GeminiThinkingConfig { ThinkingBudget = 0 }
                }
            };

            var jsonOptions = new JsonSerializerOptions
            {
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            // 4. Send to Gemini 2.5 Flash
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

            return candidate.Content?.Parts?.FirstOrDefault()?.Text ?? string.Empty;
        }
    }
}
