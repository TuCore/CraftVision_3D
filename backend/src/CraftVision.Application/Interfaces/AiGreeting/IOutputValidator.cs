using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IOutputValidator
{
    bool IsValid(string output, PromptContext context);
}
