using System.Security.Claims;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class AiChatController : ControllerBase
    {
        private readonly IAiChatService _aiChatService;
        
        public AiChatController(IAiChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
                throw new UnauthorizedAccessException("User must be logged in.");
            return userId;
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
        {
            var userId = GetUserId();
            var session = await _aiChatService.CreateSessionAsync(userId, request.Title);
            return Ok(session);
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = GetUserId();
            var sessions = await _aiChatService.GetUserSessionsAsync(userId);
            return Ok(sessions);
        }

        [HttpGet("sessions/{sessionId}/messages")]
        public async Task<IActionResult> GetSessionMessages(Guid sessionId)
        {
            var messages = await _aiChatService.GetSessionMessagesAsync(sessionId);
            return Ok(messages);
        }

        [HttpPost("sessions/{sessionId}/messages")]
        public async Task<IActionResult> SendMessage(Guid sessionId, [FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Content))
                    return BadRequest("Message content cannot be empty.");

                var userId = GetUserId();
                var result = await _aiChatService.SendMessageAsync(userId, sessionId, request.Content);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

    public class CreateSessionRequest
    {
        public string? Title { get; set; }
    }

    public class SendMessageRequest
    {
        public string Content { get; set; } = string.Empty;
    }
}
