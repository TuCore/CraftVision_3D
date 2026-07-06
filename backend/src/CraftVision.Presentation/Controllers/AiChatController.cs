using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/chat")]
    public class AiChatController : ControllerBase
    {
        private readonly IAiChatService _aiChatService;
        private readonly IUnitOfWork _unitOfWork;
        
        public AiChatController(IAiChatService aiChatService, IUnitOfWork unitOfWork)
        {
            _aiChatService = aiChatService;
            _unitOfWork = unitOfWork;
        }

        private async Task<Guid> GetOrCreateUserIdAsync()
        {
            var mockUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"); 
            Console.WriteLine($"[DEBUG] GetOrCreateUserIdAsync called.");
            
            var existingUser = await _unitOfWork.Users.GetByEmailAsync("mock@craftvision.com");
            if (existingUser == null)
            {
                Console.WriteLine($"[DEBUG] User not found. Creating user {mockUserId}");
                var newUser = new CraftVision.Domain.Entities.User
                {
                    Id = mockUserId,
                    Email = "mock@craftvision.com",
                    FullName = "Mock User",
                    PasswordHash = "MOCK",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _unitOfWork.Users.Add(newUser);
                await _unitOfWork.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] User created and saved.");
            }
            else
            {
                Console.WriteLine($"[DEBUG] User found in DB. ID: {existingUser.Id}");
            }
            
            return mockUserId;
        }

        [HttpPost("sessions")]
        public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
        {
            var userId = await GetOrCreateUserIdAsync();
            var session = await _aiChatService.CreateSessionAsync(userId, request.Title);
            return Ok(session);
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions()
        {
            var userId = await GetOrCreateUserIdAsync();
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

                var userId = await GetOrCreateUserIdAsync();
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
