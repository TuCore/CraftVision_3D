using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Services.AiGreeting;

public class PostProcessor : IPostProcessor
{
    public GreetingResponseDto Process(string rawOutput, PromptContext context, AiModelOptions modelOptions)
    {
        var cleaned = rawOutput.Trim('"', ' ', '\n', '\r');
        cleaned = cleaned.Replace("Output:", "").Trim();

        int score = 80;
        
        // Basic quality score calculation
        if (!string.IsNullOrEmpty(context.SpecialMemory) && cleaned.Contains(context.SpecialMemory.Split(' ')[0]))
        {
            score += 10;
        }

        if (!cleaned.StartsWith("Chúc") && !cleaned.StartsWith("Nhân dịp"))
        {
            score += 5;
        }

        return new GreetingResponseDto
        {
            Message = cleaned,
            Metadata = new GreetingMetadata
            {
                Model = modelOptions.Model,
                PromptVersion = "v1.0", // from config
                QualityScore = score,
                QualityLabel = score >= 90 ? "Excellent" : "Good"
            }
        };
    }
}
