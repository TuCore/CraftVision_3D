using CraftVision.Application.DTOs.AiGreeting;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IGreetingRequestValidator
{
    bool Validate(GreetingRequestDto request, out string errorMessage);
}
