using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;
using Pgvector;

namespace CraftVision.Domain.Entities
{
    public class KnowledgeMaterial
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public decimal? CurrentPrice { get; set; }
        

        public MaterialUnit? Unit { get; set; }
        
        public string? PurchaseUrl { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime LastCheckedAt { get; set; } = DateTime.UtcNow;
        
        public Vector? Embedding { get; set; }
        public string? SearchKeywords { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<DiyPlanMaterial> DiyPlanMaterials { get; set; } = new List<DiyPlanMaterial>();
    }
}
