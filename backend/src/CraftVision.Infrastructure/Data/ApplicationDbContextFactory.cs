using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using Npgsql;
using Npgsql.NameTranslation;

namespace CraftVision.Infrastructure.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "CraftVision.Presentation");
            if (!Directory.Exists(basePath))
            {
                basePath = Directory.GetCurrentDirectory(); // Fallback if ran from Presentation folder
            }

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            var activeConnName = configuration["ActiveConnection"] ?? "DockerConnection";
            var connectionString = configuration.GetConnectionString(activeConnName);

            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
            dataSourceBuilder.UseVector();
            var nullTranslator = new NpgsqlNullNameTranslator();
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.UserTier>("user_tier_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.FileType>("file_type_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MessageRole>("message_role_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.RequestStatus>("request_status_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.Difficulty>("difficulty_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.OptionLevel>("option_level_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MaterialUnit>("material_unit_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.OrderStatus>("order_status_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.PaymentMethod>("payment_method_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.PaymentStatus>("payment_status_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.NfcStatus>("nfc_status_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MediaType>("media_type_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.GiftStatus>("gift_status_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MessageSource>("message_source_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.ProductType>("product_type_enum", nullTranslator);
            dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.ModelType>("model_type_enum", nullTranslator);
            
            var dataSource = dataSourceBuilder.Build();

            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
            builder.UseNpgsql(dataSource, o => 
            {
                o.UseVector();
                o.MapEnum<CraftVision.Domain.Enums.UserTier>("user_tier_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.FileType>("file_type_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.MessageRole>("message_role_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.RequestStatus>("request_status_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.Difficulty>("difficulty_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.OptionLevel>("option_level_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.MaterialUnit>("material_unit_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.OrderStatus>("order_status_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.PaymentMethod>("payment_method_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.PaymentStatus>("payment_status_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.NfcStatus>("nfc_status_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.MediaType>("media_type_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.GiftStatus>("gift_status_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.MessageSource>("message_source_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.ProductType>("product_type_enum", nameTranslator: nullTranslator);
                o.MapEnum<CraftVision.Domain.Enums.ModelType>("model_type_enum", nameTranslator: nullTranslator);
            })
            .UseSnakeCaseNamingConvention();

            return new ApplicationDbContext(builder.Options);
        }
    }
}
