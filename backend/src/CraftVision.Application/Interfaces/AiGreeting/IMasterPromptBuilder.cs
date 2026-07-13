using CraftVision.Application.Models.AiGreeting;
using System.Collections.Generic;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IMasterPromptBuilder
{
    List<PromptMessage> Build(PromptContext context);
}
