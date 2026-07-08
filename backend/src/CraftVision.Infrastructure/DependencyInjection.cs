using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.Extensions.Http;
using System.Net.Http.Headers;
using CraftVision.Application.Interfaces.AI.Tripo;
using CraftVision.Infrastructure.AI.Tripo;
using CraftVision.Infrastructure.Workers;

namespace CraftVision.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Register Repositories
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IKnowledgeRepository, CraftVision.Infrastructure.Repositories.KnowledgeRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IAi3dRequestRepository, CraftVision.Infrastructure.Repositories.Ai3dRequestRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IUploadedFileRepository, CraftVision.Infrastructure.Repositories.UploadedFileRepository>();

            services.AddHttpContextAccessor();
            services.AddScoped<CraftVision.Application.Interfaces.Providers.IObjectStorageService, CraftVision.Infrastructure.Providers.LocalObjectStorageService>();

            // Register Gemini AI Services with Polly retry policy
            var retryPolicy = GetRetryPolicy();
            var geminiApiKey = configuration["AiSettings:Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini API Key is missing");

            void ConfigureGeminiClient(HttpClient client)
            {
                client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
                client.DefaultRequestHeaders.Add("x-goog-api-key", geminiApiKey);
                client.Timeout = TimeSpan.FromSeconds(300);
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

            // Register Tripo3D Client with Polly
            services.AddHttpClient<ITripoClient, TripoClient>(client =>
            {
                var baseUrl = configuration["Tripo3D:BaseUrl"] ?? "https://api.tripo3d.ai";
                var apiKey = configuration["Tripo3D:ApiKey"] ?? string.Empty;
                client.BaseAddress = new Uri(baseUrl);
                if (!string.IsNullOrEmpty(apiKey))
                {
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                }
                client.DefaultRequestHeaders.Add("User-Agent", "CraftVision3D/1.0");
                client.Timeout = TimeSpan.FromSeconds(15);
            })
            .AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
            .AddTransientHttpErrorPolicy(policy => policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));

            // Register Tripo3D Background Worker
            services.AddHostedService<Tripo3DTaskProcessorService>();

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
