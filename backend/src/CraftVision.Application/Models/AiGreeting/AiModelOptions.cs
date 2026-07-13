namespace CraftVision.Application.Models.AiGreeting;

public class AiModelOptions
{
    public string Model { get; set; } = "gemini-2.5-flash";
    public bool SupportsJson { get; set; } = true;
    public bool SupportsThinking { get; set; } = true;
    public int MaxInputTokens { get; set; } = 1048576;
    public int MaxOutputTokens { get; set; } = 8192;
    public string ApiKey { get; set; } = string.Empty;
}
