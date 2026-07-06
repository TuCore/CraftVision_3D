using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using Pgvector;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using CraftVision.Application.Interfaces.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Data.Seeders
{
    public static class AiDataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var embeddingService = scope.ServiceProvider.GetRequiredService<IEmbeddingService>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("AiDataSeeder");

            if (await context.KnowledgeMaterials.AnyAsync())
            {
                logger.LogInformation("Database already seeded with knowledge materials.");
                return;
            }

            logger.LogInformation("Seeding AI Knowledge Base (Materials and Tutorials)...");

            var materials = new List<KnowledgeMaterial>
            {
                new KnowledgeMaterial
                {
                    Name = "Pink Yarn (Acrylic, 100g)",
                    Category = "Yarn",
                    CurrentPrice = 5.00m,
                    Unit = MaterialUnit.piece,
                    Difficulty = Difficulty.Easy,
                    Occasion = "Valentine",
                    EstimatedMinutes = null,
                    EstimatedCost = 5.00m,
                    SearchKeywords = "pink yarn crochet knitting soft acrylic"
                },
                new KnowledgeMaterial
                {
                    Name = "Crochet Hook Set (2mm - 6mm)",
                    Category = "Tools",
                    CurrentPrice = 12.00m,
                    Unit = MaterialUnit.set,
                    Difficulty = Difficulty.Easy,
                    Occasion = null,
                    EstimatedCost = 12.00m,
                    SearchKeywords = "hook crochet needle tool"
                }
            };

            foreach (var mat in materials)
            {
                var textToEmbed = $"{mat.Name} {mat.Category} {mat.SearchKeywords}";
                var vector = await embeddingService.GenerateEmbeddingAsync(textToEmbed);
                mat.Embedding = new Vector(vector);
                context.KnowledgeMaterials.Add(mat);
                await Task.Delay(6000);
            }

            var tutorials = new List<KnowledgeTutorial>
            {
                new KnowledgeTutorial
                {
                    Title = "How to Crochet a Basic Bunny Plushie",
                    VideoUrl = "https://youtube.com/example-bunny",
                    Difficulty = Difficulty.Easy,
                    Occasion = "Valentine",
                    EstimatedMinutes = 120,
                    EstimatedCost = 15.00m
                }
            };

            foreach (var tut in tutorials)
            {
                var textToEmbed = $"{tut.Title} {tut.Difficulty} {tut.Occasion}";
                var vector = await embeddingService.GenerateEmbeddingAsync(textToEmbed);
                tut.Embedding = new Vector(vector);
                context.KnowledgeTutorials.Add(tut);
                await Task.Delay(6000);
            }

            await context.SaveChangesAsync();
            logger.LogInformation("AI Knowledge Base seeded successfully.");
        }
    }
}
