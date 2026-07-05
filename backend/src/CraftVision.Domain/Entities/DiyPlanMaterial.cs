namespace CraftVision.Domain.Entities
{
    public class DiyPlanMaterial
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DiyPlanId { get; set; }
        public Guid MaterialId { get; set; }
        
        public string? NameSnapshot { get; set; }
        public decimal? PriceSnapshot { get; set; }
        public string? PurchaseUrlSnapshot { get; set; }
        public decimal? Quantity { get; set; }
        public string? SearchKeywordsSnapshot { get; set; }

        public DiyPlan? DiyPlan { get; set; }
        public KnowledgeMaterial? Material { get; set; }
    }
}
