using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class AiRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid SessionId { get; set; }
        public string PromptText { get; set; } = string.Empty;
        public Guid? UploadedFileId { get; set; }
        
        // JSONB column mapped as string
        public string? ParsedIntent { get; set; }
        
        public int? RequestTokens { get; set; }
        public int? ResponseTokens { get; set; }
        public int? TotalTokens { get; set; }
        

        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public AiChatSession? Session { get; set; }
        public UploadedFile? UploadedFile { get; set; }
        
        public ICollection<AiChatMessage> Messages { get; set; } = new List<AiChatMessage>();
        public DiyPlan? DiyPlan { get; set; }
    }
}
