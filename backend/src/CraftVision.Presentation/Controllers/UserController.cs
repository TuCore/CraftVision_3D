using System.Security.Claims;
using CraftVision.Application.DTOs.User;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            if (Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
            {
                var profile = await _userService.GetProfileAsync(userId);
                if (profile == null)
                    return NotFound(new { Message = "Người dùng không tồn tại." });

                return Ok(profile);
            }
            return Unauthorized(new { Message = "Không thể xác thực người dùng." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto request)
    {
        try
        {
            if (Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
            {
                var profile = await _userService.UpdateProfileAsync(userId, request);
                return Ok(profile);
            }
            return Unauthorized(new { Message = "Không thể xác thực người dùng." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
