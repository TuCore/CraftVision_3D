namespace CraftVision.Application.DTOs.AiGreeting;

public class GreetingResponseDto
{
    public string Message { get; set; } = string.Empty;
    public GreetingMetadata Metadata { get; set; } = new GreetingMetadata();
}

public class GreetingMetadata
{
    public string Model { get; set; } = string.Empty;
    public string PromptVersion { get; set; } = string.Empty;
    public long GenerationTimeMs { get; set; }
    public int QualityScore { get; set; }
    public string QualityLabel { get; set; } = string.Empty;
}
