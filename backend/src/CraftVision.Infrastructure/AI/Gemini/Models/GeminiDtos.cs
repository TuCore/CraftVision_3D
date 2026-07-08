using System.Text.Json.Serialization;

namespace CraftVision.Infrastructure.AI.Gemini.Models
{
    // Requests
    public class GeminiGenerateContentRequest
    {
        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; } = new();

        [JsonPropertyName("generationConfig")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public GeminiGenerationConfig? GenerationConfig { get; set; }

        [JsonPropertyName("systemInstruction")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
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
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Text { get; set; }

        [JsonPropertyName("inlineData")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
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
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public float? Temperature { get; set; }

        [JsonPropertyName("responseMimeType")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? ResponseMimeType { get; set; }

        [JsonPropertyName("responseSchema")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public object? ResponseSchema { get; set; }

        [JsonPropertyName("maxOutputTokens")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? MaxOutputTokens { get; set; }
    }

    // Embeddings Requests
    public class GeminiEmbedContentRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; set; } = "models/gemini-embedding-2";

        [JsonPropertyName("content")]
        public GeminiContent Content { get; set; } = new();

        [JsonPropertyName("outputDimensionality")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
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

        [JsonPropertyName("totalCost")]
        public string? TotalCost { get; set; }

        [JsonPropertyName("searchKeyword")]
        public string? SearchKeyword { get; set; }

        [JsonPropertyName("videoUrl")]
        public string? VideoUrl { get; set; }

        [JsonPropertyName("materials")]
        public List<GeminiSuggestionMaterialDto>? Materials { get; set; }
    }

    public class GeminiSuggestionMaterialDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("quantity")]
        public string Quantity { get; set; } = string.Empty;
        
        [JsonPropertyName("price")]
        public string Price { get; set; } = string.Empty;
        
        [JsonPropertyName("total")]
        public string Total { get; set; } = string.Empty;
        
        [JsonPropertyName("purchaseUrl")]
        public string? PurchaseUrl { get; set; }
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
