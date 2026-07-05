namespace CraftVision.Domain.Entities
{
    public class AiChatSession
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string? Title { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public ICollection<AiRequest> Requests { get; set; } = new List<AiRequest>();
        public ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
    }
}
