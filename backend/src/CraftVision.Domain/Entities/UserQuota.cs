namespace CraftVision.Domain.Entities
{
    public class UserQuota
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public int DailyRequestsUsed { get; set; } = 0;
        public int DailyLimit { get; set; } = 5;
        public DateTime LastResetDate { get; set; } = DateTime.UtcNow.Date;

        public User? User { get; set; }
    }
}
