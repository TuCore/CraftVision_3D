using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.AI
{
    public interface IAiSuggestionGenerator
    {
        Task<List<GiftSuggestion>> GenerateSuggestionsAsync(string intent, string retrievedContext);
    }
}
