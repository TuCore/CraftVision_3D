using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IPromptPipeline
{
    PromptContext Process(PromptContext context);
}
