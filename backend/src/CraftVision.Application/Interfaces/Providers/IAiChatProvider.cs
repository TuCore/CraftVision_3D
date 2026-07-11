namespace CraftVision.Application.Interfaces.Providers
{
    public record AiChatResponse(string Content, string FinishReason);

    public interface IAiChatProvider
    {
        Task<AiChatResponse> GenerateChatResponseAsync(string systemPrompt, IEnumerable<(string Role, string Content)> chatHistory, string userMessage);
    }
}
