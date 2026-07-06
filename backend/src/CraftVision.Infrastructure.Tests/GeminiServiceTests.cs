using System.Net;
using System.Text.Json;
using CraftVision.Infrastructure.AI.Gemini;
using Moq;
using Moq.Protected;
using Polly;
using Polly.Extensions.Http;

namespace CraftVision.Infrastructure.Tests
{
    public class GeminiServiceTests
    {
        private readonly Mock<HttpMessageHandler> _httpMessageHandlerMock;
        private readonly HttpClient _httpClient;

        public GeminiServiceTests()
        {
            _httpMessageHandlerMock = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_httpMessageHandlerMock.Object)
            {
                BaseAddress = new Uri("https://generativelanguage.googleapis.com/")
            };
        }

        [Fact]
        public async Task GenerateSuggestionsAsync_SafetyBlocked_ThrowsException()
        {
            // Arrange
            var responseJson = @"{
                ""candidates"": [
                    {
                        ""finishReason"": ""SAFETY"",
                        ""content"": { ""parts"": [] }
                    }
                ]
            }";

            _httpMessageHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            var generator = new GeminiSuggestionGenerator(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => generator.GenerateSuggestionsAsync("Make a gift", "context"));
            Assert.Contains("safety settings", ex.Message);
        }

        [Fact]
        public async Task GenerateSuggestionsAsync_InvalidJson_ThrowsJsonException()
        {
            // Arrange
            var responseJson = @"{
                ""candidates"": [
                    {
                        ""finishReason"": ""STOP"",
                        ""content"": { ""parts"": [ { ""text"": ""INVALID_JSON_HERE"" } ] }
                    }
                ]
            }";

            _httpMessageHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            var generator = new GeminiSuggestionGenerator(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => generator.GenerateSuggestionsAsync("Make a gift", "context"));
            Assert.Contains("Failed to parse JSON response", ex.Message);
        }

        [Fact]
        public async Task GenerateEmbeddingAsync_EmptyValues_ThrowsException()
        {
            // Arrange
            var responseJson = @"{
                ""embedding"": {
                    ""values"": []
                }
            }";

            _httpMessageHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            var service = new GeminiEmbeddingService(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => service.GenerateEmbeddingAsync("text"));
            Assert.Contains("empty or invalid values", ex.Message);
        }
    }
}
