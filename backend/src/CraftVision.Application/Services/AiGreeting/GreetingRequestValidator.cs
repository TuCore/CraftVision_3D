using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Interfaces.AiGreeting;

namespace CraftVision.Application.Services.AiGreeting;

public class GreetingRequestValidator : IGreetingRequestValidator
{
    public bool Validate(GreetingRequestDto request, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(request.Occasion))
        {
            errorMessage = "Occasion is required.";
            return false;
        }

        if (request.Occasion.ToLower().Contains("wedding") && request.SpecialMemory.ToLower().Contains("tình cũ"))
        {
            errorMessage = "Conflict detected: Cannot mention past relationships on a wedding occasion.";
            return false;
        }

        return true;
    }
}
