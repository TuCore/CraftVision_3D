using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IRuleConflictEngine
{
    PromptContext ResolveConflicts(PromptContext context);
}
