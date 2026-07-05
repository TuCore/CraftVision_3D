namespace CraftVision.Domain.Entities
{
    public class DiyPlanTutorial
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DiyPlanId { get; set; }
        public Guid TutorialId { get; set; }

        public DiyPlan? DiyPlan { get; set; }
        public KnowledgeTutorial? Tutorial { get; set; }
    }
}
