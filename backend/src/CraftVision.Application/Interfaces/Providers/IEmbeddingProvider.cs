namespace CraftVision.Application.Interfaces.Providers
{
    public interface IEmbeddingProvider
    {
        Task<float[]> GenerateEmbeddingAsync(string text);
    }
}
