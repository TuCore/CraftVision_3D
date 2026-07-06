namespace CraftVision.Application.Interfaces.Providers
{
    public interface IAiChatProvider
    {
        Task<string> GenerateChatResponseAsync(string systemPrompt, IEnumerable<(string Role, string Content)> chatHistory, string userMessage);
    }
}
