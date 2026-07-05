using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class DiyPlan
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid RequestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Occasion { get; set; }
        

        public OptionLevel? OptionLevel { get; set; }
        

        public Difficulty? Difficulty { get; set; }
        
        public int? EstimatedMinutes { get; set; }
        public decimal? EstimatedCost { get; set; }
        
        public string? MaterialsJson { get; set; }
        public string? StepsJson { get; set; }
        
        public string? ShareSlug { get; set; }
        public bool IsPublic { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsSelected { get; set; } = false;

        public User? User { get; set; }
        public AiRequest? Request { get; set; }
        public ICollection<DiyPlanMaterial> PlanMaterials { get; set; } = new List<DiyPlanMaterial>();
        public ICollection<DiyPlanTutorial> PlanTutorials { get; set; } = new List<DiyPlanTutorial>();
    }
}
