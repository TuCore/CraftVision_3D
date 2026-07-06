using CraftVision.Application.GiftSuggestions.Commands;
using CraftVision.Application.GiftSuggestions.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/gift-chat")]
    [Authorize] // Require user to be logged in
    public class GiftChatController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GiftChatController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("suggestions")]
        public async Task<ActionResult<List<GiftSuggestionDto>>> GenerateSuggestions([FromBody] GenerateSuggestionsCommand command)
        {
            // Set UserId from Claims
            if (Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
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

        [HttpPost("plan/{suggestionId}")]
        public async Task<ActionResult<DiyPlanDto>> GenerateDetailedPlan(Guid suggestionId, [FromBody] GenerateDetailedPlanCommand command)
        {
            // Set UserId from Claims
            if (Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
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
    }
}
