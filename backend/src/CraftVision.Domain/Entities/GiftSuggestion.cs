using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class GiftSuggestion
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RequestId { get; set; }
        
        public string Name { get; set; } = string.Empty;
        
        public Difficulty? Difficulty { get; set; }
        
        public string? EstimatedCostRange { get; set; }
        public string? EstimatedTime { get; set; }
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public AiRequest? Request { get; set; }
    }
}
