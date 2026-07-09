namespace CraftVision.Application.GiftSuggestions.Dtos
{
    public class GiftChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public List<GiftSuggestionDto> Suggestions { get; set; } = new List<GiftSuggestionDto>();
    }
}
