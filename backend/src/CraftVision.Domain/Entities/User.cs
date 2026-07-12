using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        
        public string? DisplayName { get; set; }
        public string? Phone { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        

        public UserTier Tier { get; set; } = UserTier.Free;
        
        public string? AuthProvider { get; set; }
        public string? ProviderId { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public UserQuota? Quota { get; set; }
        public ICollection<UploadedFile> UploadedFiles { get; set; } = new List<UploadedFile>();
        public ICollection<AiChatSession> ChatSessions { get; set; } = new List<AiChatSession>();
        public ICollection<AiRequest> AiRequests { get; set; } = new List<AiRequest>();
        public ICollection<DiyPlan> DiyPlans { get; set; } = new List<DiyPlan>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
