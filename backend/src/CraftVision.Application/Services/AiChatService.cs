using CraftVision.Application.DTOs.Chat;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using System.Text;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using CraftVision.Application.Common.Diagnostics;
using CraftVision.Application.Common.Diagnostics.Models;
using Pgvector;

namespace CraftVision.Application.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAiChatProvider _aiChatProvider;
        private readonly IKnowledgeRetrievalService _knowledgeService;
        private readonly IEmbeddingProvider _embeddingProvider;
        private readonly IAiProfiler _profiler;
        private readonly IConfiguration _configuration;

        public AiChatService(
            IUnitOfWork unitOfWork,
            IAiChatProvider aiChatProvider,
            IKnowledgeRetrievalService knowledgeService,
            IEmbeddingProvider embeddingProvider,
            IAiProfiler profiler,
            IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _aiChatProvider = aiChatProvider;
            _knowledgeService = knowledgeService;
            _embeddingProvider = embeddingProvider;
            _profiler = profiler;
            _configuration = configuration;
        }

        public async Task<AiChatSession> CreateSessionAsync(Guid userId, string? title = null)
        {
            Console.WriteLine($"[DEBUG] Creating Session with UserId: {userId}");
            
            var session = new AiChatSession
            {
                UserId = userId,
                Title = title ?? "New Chat"
            };

            await _unitOfWork.AiChatSessions.AddAsync(session);
            await _unitOfWork.SaveChangesAsync();
            return session;
        }

        public async Task<IEnumerable<AiChatSession>> GetUserSessionsAsync(Guid userId)
        {
            return await _unitOfWork.AiChatSessions.GetUserSessionsAsync(userId);
        }

        public async Task<IEnumerable<AiChatMessage>> GetSessionMessagesAsync(Guid sessionId)
        {
            return await _unitOfWork.AiChatMessages.GetMessagesBySessionIdAsync(sessionId);
        }

        public async Task<ChatMessageResult> SendMessageAsync(Guid userId, Guid sessionId, string content)
        {
            var totalSw = Stopwatch.StartNew();
            var stepSw = new Stopwatch();

            var profile = new AiChatProfile
            {
                SessionId = sessionId,
                UserQuestion = content,
                UserQuestionLength = content.Length,
                ModelName = _configuration["AiSettings:Gemini:Model"] ?? "gemini-2.5-flash",
                EmbeddingModel = _configuration["AiSettings:Gemini:EmbeddingModel"] ?? "text-embedding-004",
                EmbeddingDimension = int.TryParse(_configuration["AiSettings:Gemini:EmbeddingDimension"], out var dim) ? dim : 768,
                TopKMaterials = 3,
                TopKTutorials = 2
            };

            try
            {
                var session = await _unitOfWork.AiChatSessions.GetByIdAsync(sessionId);
                if (session == null || session.UserId != userId)
                    throw new UnauthorizedAccessException("Session not found or access denied.");

                session.LastActiveAt = DateTime.UtcNow;

                var userMessage = new AiChatMessage
                {
                    SessionId = sessionId,
                    Role = MessageRole.User,
                    Content = content
                };
                await _unitOfWork.AiChatMessages.AddAsync(userMessage);

                stepSw.Restart();
                var vectorArray = await _embeddingProvider.GenerateEmbeddingAsync(content);
                var queryVector = new Vector(vectorArray);
                profile.EmbeddingTimeMs = stepSw.ElapsedMilliseconds;

                stepSw.Restart();
                var materials = await _knowledgeService.SearchMaterialsAsync(queryVector, topK: profile.TopKMaterials);
                var tutorials = await _knowledgeService.SearchTutorialsAsync(queryVector, topK: profile.TopKTutorials);
                profile.SearchTimeMs = stepSw.ElapsedMilliseconds;
                profile.RetrievedMaterials = materials.Count;
                profile.RetrievedTutorials = tutorials.Count;
                profile.RetrievedSources.AddRange(materials.Select(m => $"[Material] {m.Name}"));
                profile.RetrievedSources.AddRange(tutorials.Select(t => $"[Tutorial] {t.Title}"));

                stepSw.Restart();
                var systemPrompt = BuildSystemPrompt(materials, tutorials);
                var history = await _unitOfWork.AiChatMessages.GetRecentMessagesBySessionIdAsync(sessionId, 10);
                var recentHistory = history.Select(m => (m.Role.ToString(), m.Content)).ToList();
                
                profile.PromptBuildTimeMs = stepSw.ElapsedMilliseconds;
                profile.HistoryCount = recentHistory.Count;
                profile.ContextLength = systemPrompt.Length;
                profile.HistoryLength = string.Join(" ", recentHistory.Select(x => x.Item2)).Length;
                profile.FinalPromptLength = profile.ContextLength + profile.HistoryLength + content.Length;
                profile.PromptPreview = new string(systemPrompt.Take(200).ToArray());

                stepSw.Restart();
                string aiResponseContent;
                try
                {
                    var aiResponse = await _aiChatProvider.GenerateChatResponseAsync(systemPrompt, recentHistory, content);
                    aiResponseContent = aiResponse.Content;
                    profile.GeminiTimeMs = stepSw.ElapsedMilliseconds;
                    profile.GeminiFinishReason = aiResponse.FinishReason;
                }
                catch (Exception ex)
                {
                    profile.IsSuccess = false;
                    profile.ErrorReason = $"AI Provider Error ({ex.GetType().Name}): {ex.Message}";
                    throw new Exception("Lỗi khi kết nối với dịch vụ AI. Vui lòng thử lại sau.", ex);
                }
                
                profile.ResponseLength = aiResponseContent.Length;

                stepSw.Restart();
                var sources = materials.Select(m => new ChatSourceDto { Id = m.Id, Type = "Material", Name = m.Name })
                    .Concat(tutorials.Select(t => new ChatSourceDto { Id = t.Id, Type = "Tutorial", Name = t.Title }))
                    .ToList();

                var retrievedContextIds = materials.Select(m => m.Id)
                    .Concat(tutorials.Select(t => t.Id))
                    .ToList();

                var aiMessage = new AiChatMessage
                {
                    SessionId = sessionId,
                    Role = MessageRole.Assistant,
                    Content = aiResponseContent,
                    RetrievedContextIds = retrievedContextIds.Any() ? retrievedContextIds : null
                };
                
                await _unitOfWork.AiChatMessages.AddAsync(aiMessage);
                
                if (string.IsNullOrEmpty(session.Title) || session.Title == "New Chat")
                {
                    session.Title = content.Length > 30 ? content.Substring(0, 30) + "..." : content;
                }

                await _unitOfWork.SaveChangesAsync();
                profile.SaveTimeMs = stepSw.ElapsedMilliseconds;

                return new ChatMessageResult
                {
                    Message = aiMessage,
                    Sources = sources.Any() ? sources : null
                };
            }
            catch (Exception ex)
            {
                profile.IsSuccess = false;
                profile.ErrorReason = $"{ex.GetType().Name}: {ex.Message}";
                
                // Trả về một chuỗi JSON ảo (Mock Data) khi gọi AI hoặc Embedding bị lỗi
                var mockContent = $$"""
                ```json
                {
                  "text": "Xin chào! API AI đang lỗi hoặc API Key không hợp lệ. Mình gửi tạm dữ liệu giả lập (Mock Data) để test giao diện nhé!",
                  "suggestions": [ 
                    { "level": "Cơ bản", "title": "Làm đồ handmade vui nhộn", "time": "1 giờ", "price": "50.000đ" },
                    { "level": "Trung bình", "title": "Mô hình giấy 3D", "time": "3 giờ", "price": "150.000đ" }
                  ],
                  "featuredIdea": {
                     "title": "Ý tưởng nổi bật: Làm quà tặng ý nghĩa",
                     "totalCost": "200.000đ",
                     "totalTime": "2 giờ",
                     "materialsCount": 3,
                     "materials": [ 
                        { "name": "Vật liệu 1", "price": "50.000đ", "link": "https://shopee.vn/search?keyword=handmade", "keyword": "handmade" },
                        { "name": "Vật liệu 2", "price": "100.000đ", "link": "https://shopee.vn/search?keyword=thu+cong", "keyword": "thu cong" },
                        { "name": "Vật liệu 3", "price": "50.000đ", "link": "https://shopee.vn/search?keyword=diy", "keyword": "diy" }
                     ],
                     "tutorial": { "title": "Video hướng dẫn làm chi tiết", "url": "https://youtube.com/watch?v=mock", "duration": "15 phút", "views": "100K" }
                  }
                }
                ```
                """;
                
                var mockMessage = new AiChatMessage
                {
                    SessionId = sessionId,
                    Role = MessageRole.Assistant,
                    Content = mockContent
                };
                
                return new ChatMessageResult
                {
                    Message = mockMessage,
                    Sources = null
                };
            }
            finally
            {
                totalSw.Stop();
                profile.TotalTimeMs = totalSw.ElapsedMilliseconds;
                _profiler.Log(profile);
            }
        }

        /*
        // ----- ĐOẠN CODE CŨ CỦA NHÁNH MAIN (Đã bị comment lại làm tham chiếu) -----
        // Tạm thời comment dòng gọi AI thật để test giao diện cho mượt
        // var aiResponseContent = await _aiChatProvider.GenerateChatResponseAsync(systemPrompt, recentHistory, content);
        
        // Trả về một chuỗi JSON ảo (Mock Data) đúng chuẩn Format của frontend
        var aiResponseContent = $$"""
        ```json
        {
          "text": "Xin chào! Bạn vừa chat câu: '{{content}}'. Hệ thống đang ở chế độ giả lập (Mock AI) để test giao diện nên tốc độ phản hồi sẽ cực kỳ nhanh mượt!",
          "suggestions": [ 
            { "level": "Cơ bản", "title": "Làm đồ handmade vui nhộn", "time": "1 giờ", "price": "50.000đ" },
            { "level": "Trung bình", "title": "Mô hình giấy 3D", "time": "3 giờ", "price": "150.000đ" }
          ],
          "featuredIdea": {
             "title": "Ý tưởng nổi bật: Làm quà tặng ý nghĩa",
             "totalCost": "200.000đ",
             "totalTime": "2 giờ",
             "materialsCount": 3,
             "materials": [ 
                { "name": "Vật liệu 1", "price": "50.000đ", "link": "https://shopee.vn/search?keyword=handmade", "keyword": "handmade" },
                { "name": "Vật liệu 2", "price": "100.000đ", "link": "https://shopee.vn/search?keyword=thu+cong", "keyword": "thu cong" },
                { "name": "Vật liệu 3", "price": "50.000đ", "link": "https://shopee.vn/search?keyword=diy", "keyword": "diy" }
             ],
             "tutorial": { "title": "Video hướng dẫn làm chi tiết", "url": "https://youtube.com/watch?v=mock", "duration": "15 phút", "views": "100K" }
          }
        }
        ```
        """;

        // Giả lập delay 1 tí (khoảng 1.5 giây) cho có cảm giác giống AI thật đang suy nghĩ
        await Task.Delay(1500);
        */

        private string BuildSystemPrompt(List<KnowledgeMaterial> materials, List<KnowledgeTutorial> tutorials)
        {
            var sb = new StringBuilder();
            sb.AppendLine("You are CraftVision AI Assistant. You help users with DIY craft ideas and materials.");
            sb.AppendLine("You MUST always reply with valid JSON inside a ```json ... ``` code block.");
            sb.AppendLine("The JSON must strictly match this schema:");
            sb.AppendLine("{");
            sb.AppendLine("  \"text\": \"Your conversational text here...\",");
            sb.AppendLine("  \"suggestions\": [ { \"level\": \"Cơ bản|Trung bình|Nâng cao\", \"title\": \"Idea title\", \"time\": \"e.g. 2 giờ\", \"price\": \"e.g. 150.000đ\" } ],");
            sb.AppendLine("  \"featuredIdea\": {");
            sb.AppendLine("     \"title\": \"Title of the best idea from suggestions\",");
            sb.AppendLine("     \"totalCost\": \"Total cost string\",");
            sb.AppendLine("     \"totalTime\": \"Total time string\",");
            sb.AppendLine("     \"materialsCount\": 5,");
            sb.AppendLine("     \"materials\": [ { \"name\": \"Name\", \"price\": \"Price\", \"link\": \"Shopee search link\", \"keyword\": \"Search keyword\" } ],");
            sb.AppendLine("     \"tutorial\": { \"title\": \"Video title\", \"url\": \"YouTube link\", \"duration\": \"e.g. 15 phút\", \"views\": \"Views estimate\" }");
            sb.AppendLine("  }");
            sb.AppendLine("}");
            sb.AppendLine("If the user is just greeting or you have no ideas to suggest, just provide the \"text\" field and leave others null/empty.");
            sb.AppendLine("You should prioritize using the provided knowledge below to suggest materials and tutorials.");
            sb.AppendLine("If the provided knowledge is missing or not relevant to the user's request, you MUST use your general knowledge to invent and suggest creative DIY ideas, estimate prices in VND, and provide relevant YouTube search queries for tutorials. Do not say you don't have enough info.");
            
            if (materials.Any())
            {
                sb.AppendLine("\n[AVAILABLE MATERIALS]");
                foreach (var m in materials)
                {
                    sb.AppendLine($"- Name: {m.Name}, Category: {m.Category}, Price: {m.CurrentPrice}");
                }
            }

            if (tutorials.Any())
            {
                sb.AppendLine("\n[AVAILABLE TUTORIALS]");
                foreach (var t in tutorials)
                {
                    sb.AppendLine($"- Title: {t.Title}, Difficulty: {t.Difficulty}, Video: {t.VideoUrl}");
                }
            }

            return sb.ToString();
        }
    }
}
