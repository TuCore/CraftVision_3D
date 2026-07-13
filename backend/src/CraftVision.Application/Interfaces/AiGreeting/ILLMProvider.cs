using CraftVision.Application.Models.AiGreeting;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface ILLMProvider
{
    Task<string> GenerateResponseAsync(List<PromptMessage> messages);
}
