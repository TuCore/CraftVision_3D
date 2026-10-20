using CraftVision.Application.GiftSuggestions.Commands;
using CraftVision.Application.GiftSuggestions.Dtos;
using CraftVision.Application.DTOs.Chat;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/gift-chat")]
    [Authorize] // Require user to be logged in
    public class GiftChatController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;

        public GiftChatController(IMediator mediator, IUnitOfWork unitOfWork)
        {
            _mediator = mediator;
            _unitOfWork = unitOfWork;
        }

        private bool TryGetUserId(out Guid userId) =>
            Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out userId);

        [HttpPost("suggestions")]
        public async Task<ActionResult<GiftChatResponseDto>> GenerateSuggestions([FromBody] GenerateSuggestionsCommand command)
        {
            // Set UserId from Claims
            if (TryGetUserId(out var userId))
            {
                command.UserId = userId;
            }
            else
            {
                return Unauthorized();
            }

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("sessions")]
        public async Task<ActionResult<IEnumerable<ChatSessionSummaryDto>>> GetSessions()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var sessions = await _unitOfWork.AiChatSessions.GetUserSessionsWithMessagesAsync(userId);
            var result = sessions.Select(session =>
            {
                var lastMessage = session.Messages.OrderByDescending(message => message.CreatedAt).FirstOrDefault();
                return new ChatSessionSummaryDto
                {
                    Id = session.Id,
                    Title = session.Title ?? "Gift Consultation",
                    CreatedAt = session.CreatedAt,
                    LastActiveAt = session.LastActiveAt,
                    MessageCount = session.Messages.Count,
                    LastMessagePreview = CreatePreview(lastMessage?.Content)
                };
            });

            return Ok(result);
        }

        [HttpGet("sessions/{sessionId:guid}/messages")]
        public async Task<ActionResult<ChatSessionDetailDto>> GetSessionMessages(Guid sessionId)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var session = await _unitOfWork.AiChatSessions.GetByIdAsync(sessionId);
            if (session == null || session.UserId != userId) return NotFound();

            var messages = await _unitOfWork.AiChatSessions
                .GetSessionMessagesWithDetailsAsync(sessionId, userId);

            return Ok(new ChatSessionDetailDto
            {
                Id = session.Id,
                Title = session.Title ?? "Gift Consultation",
                CreatedAt = session.CreatedAt,
                LastActiveAt = session.LastActiveAt,
                Messages = messages.Select(ToMessageDto).ToList()
            });
        }

        [HttpDelete("sessions/{sessionId:guid}")]
        public async Task<IActionResult> DeleteSession(Guid sessionId)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var session = await _unitOfWork.AiChatSessions.GetByIdAsync(sessionId);
            if (session == null || session.UserId != userId) return NotFound();

            await _unitOfWork.AiChatSessions.DeleteSessionAsync(sessionId, userId);
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPatch("sessions/{sessionId:guid}/title")]
        public async Task<IActionResult> RenameSession(Guid sessionId, [FromBody] UpdateChatSessionTitleDto request)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Title)) return ValidationProblem(ModelState);

            var session = await _unitOfWork.AiChatSessions.GetByIdAsync(sessionId);
            if (session == null || session.UserId != userId) return NotFound();

            await _unitOfWork.AiChatSessions.UpdateTitleAsync(sessionId, userId, request.Title.Trim());
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("plan/{suggestionId}")]
        public async Task<ActionResult<DiyPlanDto>> GenerateDetailedPlan(Guid suggestionId, [FromBody] GenerateDetailedPlanCommand command)
        {
            // Set UserId from Claims
            if (TryGetUserId(out var userId))
            {
                command.UserId = userId;
            }
            else
            {
                return Unauthorized();
            }

            // Ensure route param matches command body
            command.SuggestionId = suggestionId;

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        private static ChatMessageItemDto ToMessageDto(CraftVision.Domain.Entities.AiChatMessage message)
        {
            List<GiftSuggestionDto>? suggestions = null;
            if (!string.IsNullOrWhiteSpace(message.SuggestionsJson))
            {
                try
                {
                    suggestions = JsonSerializer.Deserialize<List<GiftSuggestionDto>>(message.SuggestionsJson);
                }
                catch (JsonException)
                {
                    suggestions = null;
                }
            }

            return new ChatMessageItemDto
            {
                Id = message.Id,
                Role = message.Role == MessageRole.User ? "user" : "ai",
                Content = message.Content,
                ImageUrl = message.ImageUrl,
                Suggestions = suggestions,
                CreatedAt = message.CreatedAt
            };
        }

        private static string? CreatePreview(string? content)
        {
            if (string.IsNullOrWhiteSpace(content)) return null;
            var normalized = content.ReplaceLineEndings(" ").Trim();
            return normalized.Length > 100 ? $"{normalized[..100]}..." : normalized;
        }
    }
}
