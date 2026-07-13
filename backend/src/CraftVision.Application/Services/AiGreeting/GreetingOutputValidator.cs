using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Services.AiGreeting;

public class GreetingOutputValidator : IOutputValidator
{
    public bool IsValid(string output, PromptContext context)
    {
        if (string.IsNullOrWhiteSpace(output)) return false;

        // Check word count
        var wordCount = output.Split(new[] { ' ', '\n', '\r' }, System.StringSplitOptions.RemoveEmptyEntries).Length;
        if (wordCount > context.MaxWords + 10) return false; // Allow a small buffer

        // Check Anti-patterns basic match (if we had real regex)
        if (output.StartsWith("Chúc bạn") || output.StartsWith("Nhân dịp")) return false;

        // Check Markdown
        if (output.Contains("```") || output.Contains("**")) return false;

        return true;
    }
}
