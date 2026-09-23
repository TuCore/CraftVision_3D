namespace CraftVision.Application.DTOs.Manifest
{
    public class ManifestRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string WishText { get; set; } = string.Empty;
    }

    public class ManifestResponseDto
    {
        public bool Success { get; set; }
        public int TotalWishes { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
