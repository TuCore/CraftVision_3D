namespace CraftVision.Application.Interfaces.AI
{
    public interface IGeminiVisionService
    {
        Task<string> AnalyzeImageAsync(string imageUrl, string prompt);
    }
}
