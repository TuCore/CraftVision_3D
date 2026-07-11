using CraftVision.Application.Common.Diagnostics;
using CraftVision.Application.Common.Diagnostics.Models;
using Microsoft.Extensions.Logging;
using System.Text;
namespace CraftVision.Infrastructure.Diagnostics
{
    public class AiProfiler : IAiProfiler
    {
        private readonly ILogger<AiProfiler> _logger;
        private readonly IMarkdownWriter _markdownWriter;

        public AiProfiler(ILogger<AiProfiler> logger, IMarkdownWriter markdownWriter)
        {
            _logger = logger;
            _markdownWriter = markdownWriter;
        }

        public void Log(AiChatProfile profile)
        {
            var sb = new StringBuilder();
            sb.AppendLine("========== AI CHAT PROFILER ==========");
            sb.AppendLine();
            sb.AppendLine("[GENERAL]");
            sb.AppendLine($"Timestamp      : {profile.Timestamp:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine($"Session Id     : {profile.SessionId}");
            string qPreview = profile.UserQuestion;
            if (qPreview.Length > 30)
            {
                qPreview = qPreview.Substring(0, 30) + "...";
            }
            sb.AppendLine($"Question       : \"{qPreview}\" (Preview)");
            sb.AppendLine($"Model          : {profile.ModelName}");
            sb.AppendLine($"Status         : {(profile.IsSuccess ? "SUCCESS" : "FAILED")}");
            sb.AppendLine($"Gemini Status  : {profile.GeminiStatus}");
            sb.AppendLine($"Finish Reason  : {profile.GeminiFinishReason}");
            
            if (!profile.IsSuccess && !string.IsNullOrEmpty(profile.ErrorReason))
            {
                sb.AppendLine($"Reason         : {profile.ErrorReason}");
            }
            
            sb.AppendLine();
            sb.AppendLine("[EXECUTION TIME]");
            sb.AppendLine($"Embedding      : {profile.EmbeddingTimeMs} ms");
            sb.AppendLine($"Search         : {profile.SearchTimeMs} ms");
            sb.AppendLine($"Prompt Build   : {profile.PromptBuildTimeMs} ms");
            sb.AppendLine($"Gemini API     : {profile.GeminiTimeMs} ms");
            sb.AppendLine($"Save DB        : {profile.SaveTimeMs} ms");
            sb.AppendLine($"TOTAL          : {profile.TotalTimeMs} ms");

            sb.AppendLine();
            sb.AppendLine("[EMBEDDING]");
            sb.AppendLine($"Model          : {profile.EmbeddingModel}");
            sb.AppendLine($"Dimension      : {profile.EmbeddingDimension}");

            sb.AppendLine();
            sb.AppendLine("[RAG RESULT]");
            sb.AppendLine($"Materials      : {profile.RetrievedMaterials} / Top K = {profile.TopKMaterials}");
            sb.AppendLine($"Tutorials      : {profile.RetrievedTutorials} / Top K = {profile.TopKTutorials}");
            
            if (profile.RetrievedSources != null && profile.RetrievedSources.Count > 0)
            {
                sb.AppendLine("Sources        :");
                var materials = profile.RetrievedSources.Where(s => s.StartsWith("[Material]")).ToList();
                var tutorials = profile.RetrievedSources.Where(s => s.StartsWith("[Tutorial]")).ToList();

                if (materials.Any())
                {
                    sb.AppendLine("[Material]");
                    foreach (var m in materials) sb.AppendLine($"- {m.Replace("[Material] ", "")}");
                }
                if (tutorials.Any())
                {
                    sb.AppendLine("[Tutorial]");
                    foreach (var t in tutorials) sb.AppendLine($"- {t.Replace("[Tutorial] ", "")}");
                }
            }
            else
            {
                sb.AppendLine("Sources        : (None)");
            }

            sb.AppendLine();
            sb.AppendLine("[PROMPT]");
            sb.AppendLine($"Question Len   : {profile.UserQuestionLength} chars");
            sb.AppendLine($"History Used   : {(profile.HistoryCount > 0 ? $"YES ({profile.HistoryCount} messages)" : "NO")}");
            sb.AppendLine($"Context Len    : {profile.ContextLength} chars");
            sb.AppendLine($"History Len    : {profile.HistoryLength} chars");
            sb.AppendLine($"Final Prompt   : {profile.FinalPromptLength} chars");
            sb.AppendLine("Prompt Preview : ");
            sb.AppendLine($"\"{profile.PromptPreview}\"");

            sb.AppendLine();
            sb.AppendLine("[RESPONSE]");
            sb.AppendLine($"Response Len   : {profile.ResponseLength} chars");
            sb.AppendLine("======================================");

            var logString = sb.ToString();

            if (profile.IsSuccess)
            {
                _logger.LogInformation(logString);
            }
            else
            {
                _logger.LogError(logString);
            }

            _markdownWriter.Write(logString);
        }
    }
}
