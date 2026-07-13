using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Services;

namespace CraftVision.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddMemoryCache();

            // Services
            services.AddScoped<ITripo3dService, Tripo3dService>();
            services.AddScoped<IQuotaService, QuotaService>();
            services.AddScoped<IProductCategoryService, ProductCategoryService>();
            services.AddScoped<IGiftCategoryService, GiftCategoryService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IGiftService, GiftService>();
            services.AddScoped<INfcTagService, NfcTagService>();
            services.AddScoped<IMessageTemplateService, MessageTemplateService>();
            services.AddScoped<IAiService, AiService>();

            // Ai Greeting Services
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IGreetingRequestValidator, CraftVision.Application.Services.AiGreeting.GreetingRequestValidator>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IPromptContextProvider, CraftVision.Application.Services.AiGreeting.PromptContextProvider>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IRuleConflictEngine, CraftVision.Application.Services.AiGreeting.RuleConflictEngine>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IPromptPipeline, CraftVision.Application.Services.AiGreeting.PromptPipeline>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IMasterPromptBuilder, CraftVision.Application.Services.AiGreeting.MasterPromptBuilder>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IOutputValidator, CraftVision.Application.Services.AiGreeting.GreetingOutputValidator>();
            services.AddScoped<CraftVision.Application.Interfaces.AiGreeting.IPostProcessor, CraftVision.Application.Services.AiGreeting.PostProcessor>();
            services.AddScoped<CraftVision.Application.Services.AiGreeting.IGreetingService, CraftVision.Application.Services.AiGreeting.GreetingService>();

            return services;
        }
    }
}
