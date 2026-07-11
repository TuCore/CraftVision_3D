using System;

namespace CraftVision.Application.Common.Diagnostics.Models
{
    public class AiChatProfile
    {
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public Guid SessionId { get; set; }
        public string UserQuestion { get; set; } = string.Empty;
        public int UserQuestionLength { get; set; }
        
        public long EmbeddingTimeMs { get; set; }
        public long SearchTimeMs { get; set; }
        public long PromptBuildTimeMs { get; set; }
        public long GeminiTimeMs { get; set; }
        public long SaveTimeMs { get; set; }
        public long TotalTimeMs { get; set; }
        
        public bool IsSuccess { get; set; } = true;
        public string? ErrorReason { get; set; }
        
        public string ModelName { get; set; } = string.Empty;
        public string GeminiStatus { get; set; } = "200 OK";
        public string GeminiFinishReason { get; set; } = string.Empty;

        public string EmbeddingModel { get; set; } = string.Empty;
        public int EmbeddingDimension { get; set; }

        public int TopKMaterials { get; set; }
        public int TopKTutorials { get; set; }
        public int RetrievedMaterials { get; set; }
        public int RetrievedTutorials { get; set; }
        public System.Collections.Generic.List<string> RetrievedSources { get; set; } = new();

        public int HistoryCount { get; set; }
        public int ContextLength { get; set; }
        public int HistoryLength { get; set; }
        public int FinalPromptLength { get; set; }
        public string PromptPreview { get; set; } = string.Empty;
        
        public int ResponseLength { get; set; }
    }
}
