using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IPromptContextProvider
{
    PromptContext GetContext(GreetingRequestDto request);
}
