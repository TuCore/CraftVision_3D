using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class UploadedFile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        

        public FileType FileType { get; set; } = FileType.Image;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
        public ImageAnalysisResult? ImageAnalysisResult { get; set; }
    }
}
