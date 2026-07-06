using FluentValidation;

namespace CraftVision.Application.GiftSuggestions.Commands
{
    public class GenerateSuggestionsCommandValidator : AbstractValidator<GenerateSuggestionsCommand>
    {
        public GenerateSuggestionsCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required.");
            
            RuleFor(x => x)
                .Must(x => !string.IsNullOrEmpty(x.Prompt) || !string.IsNullOrEmpty(x.ImageUrl))
                .WithMessage("At least one of Prompt or ImageUrl must be provided.");

            RuleFor(x => x.MaxCost)
                .GreaterThan(0).When(x => x.MaxCost.HasValue)
                .WithMessage("MaxCost must be greater than 0 if provided.");
        }
    }
}
