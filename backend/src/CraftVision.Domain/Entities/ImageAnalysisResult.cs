namespace CraftVision.Domain.Entities
{
    public class ImageAnalysisResult
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UploadedFileId { get; set; }
        
        public List<string>? DetectedMaterials { get; set; }
        public List<string>? DetectedColors { get; set; }
        public List<string>? DetectedTechnique { get; set; }
        
        public string? RawVisionResponse { get; set; }
        public decimal? ConfidenceScore { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public UploadedFile? UploadedFile { get; set; }
    }
}
