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
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IProductCategoryRepository, CraftVision.Infrastructure.Repositories.ProductCategoryRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IGiftCategoryRepository, CraftVision.Infrastructure.Repositories.GiftCategoryRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IProductRepository, CraftVision.Infrastructure.Repositories.ProductRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IProductImageRepository, CraftVision.Infrastructure.Repositories.ProductImageRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IOrderRepository, CraftVision.Infrastructure.Repositories.OrderRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IOrderItemRepository, CraftVision.Infrastructure.Repositories.OrderItemRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.INfcTagRepository, CraftVision.Infrastructure.Repositories.NfcTagRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IGiftRepository, CraftVision.Infrastructure.Repositories.GiftRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IGiftMediaRepository, CraftVision.Infrastructure.Repositories.GiftMediaRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IGiftAiProfileRepository, CraftVision.Infrastructure.Repositories.GiftAiProfileRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IScanHistoryRepository, CraftVision.Infrastructure.Repositories.ScanHistoryRepository>();
            services.AddScoped<CraftVision.Application.Interfaces.Repositories.IMessageTemplateRepository, CraftVision.Infrastructure.Repositories.MessageTemplateRepository>();

            services.AddHttpContextAccessor();
            services.AddScoped<CraftVision.Application.Interfaces.Providers.IObjectStorageService, CraftVision.Infrastructure.Providers.LocalObjectStorageService>();
            
            services.AddSingleton<CraftVision.Infrastructure.Diagnostics.IMarkdownWriter, CraftVision.Infrastructure.Diagnostics.MarkdownWriter>();
            services.AddScoped<CraftVision.Application.Common.Diagnostics.IAiProfiler, CraftVision.Infrastructure.Diagnostics.AiProfiler>();

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

            // Ai Greeting Infrastructure
            services.Configure<CraftVision.Application.Models.AiGreeting.AiModelOptions>(configuration.GetSection("AiGreeting"));
            services.AddSingleton<CraftVision.Application.Interfaces.AiGreeting.IJsonKnowledgeLoader, CraftVision.Infrastructure.Data.AiKnowledgeBase.JsonKnowledgeLoader>();
            services.AddHttpClient<CraftVision.Application.Interfaces.AiGreeting.ILLMProvider, CraftVision.Infrastructure.Providers.GeminiProvider>(ConfigureGeminiClient)
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
