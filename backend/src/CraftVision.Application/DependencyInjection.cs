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

            // Services
            services.AddScoped<ITripo3dService, Tripo3dService>();
            services.AddScoped<IQuotaService, QuotaService>();

            return services;
        }
    }
}
