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
            // 1. SSRF and Domain validation
            if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp))
            {
                throw new ArgumentException("Invalid image URL. Must be HTTP/HTTPS.");
            }

            // SSRF validation - commented out for local development
            // if (uri.IsLoopback || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || 
            //     uri.Host.StartsWith("127.") || uri.Host.StartsWith("169.254.") || 
            //     uri.Host.StartsWith("10.") || uri.Host.StartsWith("192.168."))
            // {
            //     throw new ArgumentException("Local or internal URLs are not allowed.");
            // }

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

            var base64Image = Convert.ToBase64String(imageBytes);
            var mimeType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";

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
                }
            };

            // 4. Send to Gemini 3.5 Flash
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

            return candidate.Content?.Parts?.FirstOrDefault()?.Text ?? string.Empty;
        }
    }
}
