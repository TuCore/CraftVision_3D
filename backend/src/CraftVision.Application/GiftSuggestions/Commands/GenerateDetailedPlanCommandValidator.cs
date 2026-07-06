using FluentValidation;

namespace CraftVision.Application.GiftSuggestions.Commands
{
    public class GenerateDetailedPlanCommandValidator : AbstractValidator<GenerateDetailedPlanCommand>
    {
        public GenerateDetailedPlanCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required.");
            RuleFor(x => x.SuggestionId).NotEmpty().WithMessage("SuggestionId is required.");
        }
    }
}
