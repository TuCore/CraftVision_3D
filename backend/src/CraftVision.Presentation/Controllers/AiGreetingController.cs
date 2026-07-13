using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Services.AiGreeting;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/ai/greetings")]
public class AiGreetingController : ControllerBase
{
    private readonly IGreetingService _greetingService;

    public AiGreetingController(IGreetingService greetingService)
    {
        _greetingService = greetingService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateGreeting([FromBody] GreetingRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _greetingService.GenerateGreetingAsync(request);
            return Ok(response);
        }
        catch (System.ArgumentException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
        catch (System.Exception ex)
        {
            // Log exception here in real code
            return StatusCode(500, new { Error = "An error occurred while generating the greeting.", Details = ex.Message });
        }
    }
}
