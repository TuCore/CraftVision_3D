using System;
using System.IO;
using System.Text;
using Microsoft.Extensions.Logging;

namespace CraftVision.Infrastructure.Diagnostics
{
    public class MarkdownWriter : IMarkdownWriter
    {
        private readonly ILogger<MarkdownWriter> _logger;

        public MarkdownWriter(ILogger<MarkdownWriter> logger)
        {
            _logger = logger;
        }

        public void Write(string content)
        {
            try
            {
                var logDir = Path.Combine(Directory.GetCurrentDirectory(), "logs");
                if (!Directory.Exists(logDir))
                {
                    Directory.CreateDirectory(logDir);
                }
                
                var fileName = $"{DateTime.UtcNow:yyyy-MM-dd}.md";
                var filePath = Path.Combine(logDir, fileName);
                
                var mdBuilder = new StringBuilder();
                mdBuilder.AppendLine("```text");
                mdBuilder.Append(content);
                mdBuilder.AppendLine("```");
                mdBuilder.AppendLine();

                File.AppendAllText(filePath, mdBuilder.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to write markdown log to file: {ex.Message}");
            }
        }
    }
}
