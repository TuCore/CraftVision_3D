using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.AI
{
    public record AiSuggestionResponse(List<GiftSuggestion> Suggestions, string FinishReason);

    public interface IAiSuggestionGenerator
    {
        Task<AiSuggestionResponse> GenerateSuggestionsAsync(string intent, string retrievedContext);
    }
}
