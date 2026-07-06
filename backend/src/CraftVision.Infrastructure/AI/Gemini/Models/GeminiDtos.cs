using System.Text.Json.Serialization;

namespace CraftVision.Infrastructure.AI.Gemini.Models
{
    // Requests
    public class GeminiGenerateContentRequest
    {
        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; } = new();

        [JsonPropertyName("generationConfig")]
        public GeminiGenerationConfig? GenerationConfig { get; set; }

        [JsonPropertyName("systemInstruction")]
        public GeminiSystemInstruction? SystemInstruction { get; set; }
    }

    public class GeminiSystemInstruction
    {
        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; } = new();
    }

    public class GeminiContent
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";

        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; } = new();
    }

    public class GeminiPart
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }

        [JsonPropertyName("inlineData")]
        public GeminiInlineData? InlineData { get; set; }
    }

    public class GeminiInlineData
    {
        [JsonPropertyName("mimeType")]
        public string MimeType { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public string Data { get; set; } = string.Empty; // Base64
    }

    public class GeminiGenerationConfig
    {
        [JsonPropertyName("temperature")]
        public float? Temperature { get; set; }

        [JsonPropertyName("responseMimeType")]
        public string? ResponseMimeType { get; set; }

        [JsonPropertyName("responseSchema")]
        public object? ResponseSchema { get; set; }
    }

    // Embeddings Requests
    public class GeminiEmbedContentRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "models/gemini-embedding-001";

        [JsonPropertyName("content")]
        public GeminiContent Content { get; set; } = new();

        [JsonPropertyName("outputDimensionality")]
        public int? OutputDimensionality { get; set; }
    }

    // Responses
    public class GeminiGenerateContentResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    public class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }

        [JsonPropertyName("finishReason")]
        public string? FinishReason { get; set; }
    }

    public class GeminiEmbedContentResponse
    {
        [JsonPropertyName("embedding")]
        public GeminiEmbedding? Embedding { get; set; }
    }

    public class GeminiEmbedding
    {
        [JsonPropertyName("values")]
        public List<float>? Values { get; set; }
    }

    // Internal Domain DTOs
    public class GeminiSuggestionResponseDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("difficulty")]
        public string Difficulty { get; set; } = "Medium";
        
        [JsonPropertyName("estimatedCostRange")]
        public string? EstimatedCostRange { get; set; }
        
        [JsonPropertyName("estimatedTime")]
        public string? EstimatedTime { get; set; }
        
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class GeminiPlanResponseDto
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("occasion")]
        public string? Occasion { get; set; }

        [JsonPropertyName("difficulty")]
        public string? Difficulty { get; set; }

        [JsonPropertyName("estimatedMinutes")]
        public int? EstimatedMinutes { get; set; }

        [JsonPropertyName("estimatedCost")]
        public decimal? EstimatedCost { get; set; }

        [JsonPropertyName("materials")]
        public List<object>? Materials { get; set; }

        [JsonPropertyName("tutorials")]
        public List<object>? Tutorials { get; set; }

        [JsonPropertyName("stepsJson")]
        public object? StepsJson { get; set; }
    }
}
