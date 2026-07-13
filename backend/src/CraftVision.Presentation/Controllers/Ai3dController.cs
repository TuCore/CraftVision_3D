using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/ai3d")]
    [Authorize]
    public class Ai3dController : ControllerBase
    {
        private readonly ITripo3dService _tripo3dService;

        public Ai3dController(ITripo3dService tripo3dService)
        {
            _tripo3dService = tripo3dService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
                throw new UnauthorizedAccessException("User must be logged in.");
            return userId;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> CreateImageTo3dTask([FromBody] CreateImageTo3dRequestDto request)
        {
            try
            {
                var userId = GetUserId();
                
                // Set IdempotencyKey if empty
                if (string.IsNullOrEmpty(request.IdempotencyKey))
                {
                    request.IdempotencyKey = Guid.NewGuid().ToString("N");
                }

                var result = await _tripo3dService.CreateImageTaskAsync(userId, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
