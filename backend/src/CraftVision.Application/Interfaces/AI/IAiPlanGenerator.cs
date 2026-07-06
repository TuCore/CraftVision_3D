using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.AI
{
    public interface IAiPlanGenerator
    {
        Task<DiyPlan> GenerateDetailedPlanAsync(string intent, GiftSuggestion chosenSuggestion, string retrievedContext);
    }
}
