using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;

namespace CraftVision.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Register Repositories
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IKnowledgeRepository, CraftVision.Infrastructure.Repositories.KnowledgeRepository>();

            // Register Gemini AI Services with Polly retry policy
            var retryPolicy = GetRetryPolicy();
            var geminiApiKey = configuration["AiSettings:Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini API Key is missing");

            void ConfigureGeminiClient(HttpClient client)
            {
                client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
                client.DefaultRequestHeaders.Add("x-goog-api-key", geminiApiKey);
                client.Timeout = TimeSpan.FromSeconds(100);
            }

            services.AddHttpClient<CraftVision.Application.Interfaces.AI.IGeminiVisionService, CraftVision.Infrastructure.AI.Gemini.GeminiVisionService>(ConfigureGeminiClient)
                .AddPolicyHandler(retryPolicy);

            services.AddHttpClient<CraftVision.Application.Interfaces.AI.IEmbeddingService, CraftVision.Infrastructure.AI.Gemini.GeminiEmbeddingService>(ConfigureGeminiClient)
                .AddPolicyHandler(retryPolicy);

            services.AddHttpClient<CraftVision.Application.Interfaces.AI.IAiSuggestionGenerator, CraftVision.Infrastructure.AI.Gemini.GeminiSuggestionGenerator>(ConfigureGeminiClient)
                .AddPolicyHandler(retryPolicy);

            services.AddHttpClient<CraftVision.Application.Interfaces.AI.IAiPlanGenerator, CraftVision.Infrastructure.AI.Gemini.GeminiPlanGenerator>(ConfigureGeminiClient)
                .AddPolicyHandler(retryPolicy);

            // Register a plain HttpClient for downloading images (SSRF mitigated)
            services.AddHttpClient("ImageDownloader", client =>
            {
                client.Timeout = TimeSpan.FromSeconds(10);
            });

            return services;
        }

        private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests) // Handle 429
                .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))); // Exponential backoff
        }
    }
}
