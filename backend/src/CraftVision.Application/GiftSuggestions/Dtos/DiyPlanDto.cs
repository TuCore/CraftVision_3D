using CraftVision.Domain.Enums;

namespace CraftVision.Application.GiftSuggestions.Dtos
{
    public class DiyPlanDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Occasion { get; set; }
        public Difficulty? Difficulty { get; set; }
        public int? EstimatedMinutes { get; set; }
        public decimal? EstimatedCost { get; set; }
        
        // These can be typed objects later, but string (JSON) is fine for now based on current schema
        public string? MaterialsJson { get; set; }
        public string? StepsJson { get; set; }
        
        public string? ShareSlug { get; set; }
    }
}
