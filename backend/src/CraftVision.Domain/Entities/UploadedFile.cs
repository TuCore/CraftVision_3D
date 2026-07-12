using System.ComponentModel.DataAnnotations.Schema;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities
{
    public class UploadedFile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public string? CloudinaryId { get; set; }
        public string? MimeType { get; set; }
        public long? FileSize { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public double? Duration { get; set; }
        

        public FileType FileType { get; set; } = FileType.Image;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
        public ImageAnalysisResult? ImageAnalysisResult { get; set; }
        public ICollection<GiftMedia> GiftMediaList { get; set; } = new List<GiftMedia>();
        public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    }
}
