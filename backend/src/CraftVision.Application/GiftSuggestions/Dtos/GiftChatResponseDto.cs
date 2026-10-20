namespace CraftVision.Application.GiftSuggestions.Dtos
{
    public class GiftChatResponseDto
    {
        public Guid SessionId { get; set; }
        public string SessionTitle { get; set; } = string.Empty;
        public string Reply { get; set; } = string.Empty;
        public List<GiftSuggestionDto> Suggestions { get; set; } = new List<GiftSuggestionDto>();
    }
}
