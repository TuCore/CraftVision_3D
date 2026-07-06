using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;
using Pgvector;

namespace CraftVision.Domain.Entities
{
    public class KnowledgeTutorial
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        

        public Difficulty? Difficulty { get; set; }
        
        public int? EstimatedMinutes { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public Vector? Embedding { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<DiyPlanTutorial> DiyPlanTutorials { get; set; } = new List<DiyPlanTutorial>();
    }
}
