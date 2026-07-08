using CraftVision.Domain.Enums;

namespace CraftVision.Application.GiftSuggestions.Dtos
{
    public class GiftSuggestionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Difficulty? Difficulty { get; set; }
        public string? EstimatedCostRange { get; set; }
        public string? EstimatedTime { get; set; }
        public string? Description { get; set; }
        public string? TotalCost { get; set; }
        public string? SearchKeyword { get; set; }
        public string? VideoUrl { get; set; }
        public string? MaterialsJson { get; set; }
    }
}
