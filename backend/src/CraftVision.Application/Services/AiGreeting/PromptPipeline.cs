using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Services.AiGreeting;

public class PromptPipeline : IPromptPipeline
{
    public PromptContext Process(PromptContext context)
    {
        // Normalize
        context.SenderName = context.SenderName.Trim();
        context.ReceiverName = context.ReceiverName.Trim();
        
        // Budget Trim (prevent knowledge from becoming too large)
        if (context.AntiPatterns.Length > 1000)
            context.AntiPatterns = context.AntiPatterns.Substring(0, 1000) + "...";
            
        if (context.CreativityRules.Length > 1000)
            context.CreativityRules = context.CreativityRules.Substring(0, 1000) + "...";

        return context;
    }
}
