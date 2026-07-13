using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IPostProcessor
{
    GreetingResponseDto Process(string rawOutput, PromptContext context, AiModelOptions modelOptions);
}
