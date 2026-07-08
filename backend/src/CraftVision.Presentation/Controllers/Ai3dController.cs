using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/ai3d")]
    public class Ai3dController : ControllerBase
    {
        private readonly ITripo3dService _tripo3dService;
        private readonly IUnitOfWork _unitOfWork;

        public Ai3dController(ITripo3dService tripo3dService, IUnitOfWork unitOfWork)
        {
            _tripo3dService = tripo3dService;
            _unitOfWork = unitOfWork;
        }

        private async Task<Guid> GetOrCreateUserIdAsync()
        {
            // Same mock auth strategy used in AiChatController for testing
            var mockUserId = Guid.Parse("11111111-1111-1111-1111-111111111111"); 
            var existingUser = await _unitOfWork.Users.GetByEmailAsync("mock@craftvision.com");
            if (existingUser == null)
            {
                var newUser = new User
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
            }
            return mockUserId;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> CreateImageTo3dTask([FromBody] CreateImageTo3dRequestDto request)
        {
            try
            {
                var userId = await GetOrCreateUserIdAsync();
                
                // Set IdempotencyKey if empty
                if (string.IsNullOrEmpty(request.IdempotencyKey))
                {
                    request.IdempotencyKey = Guid.NewGuid().ToString("N");
                }

                var result = await _tripo3dService.CreateImageTaskAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
