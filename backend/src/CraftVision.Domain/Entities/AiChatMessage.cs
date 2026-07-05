using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class AiChatMessage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SessionId { get; set; }
        public Guid? RequestId { get; set; }
        

        public MessageRole Role { get; set; }
        
        public string Content { get; set; } = string.Empty;
        public Guid? ImageFileId { get; set; }
        public List<Guid>? RetrievedContextIds { get; set; }
        public int? TokensUsed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public AiChatSession? Session { get; set; }
        public AiRequest? Request { get; set; }
        public UploadedFile? ImageFile { get; set; }
    }
}
