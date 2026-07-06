using System;
using System.IO;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/knowledge-base")]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly IKnowledgeRetrievalService _knowledgeService;

        public KnowledgeBaseController(IKnowledgeRetrievalService knowledgeService)
        {
            _knowledgeService = knowledgeService;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedKnowledgeBase()
        {
            try
            {
                await _knowledgeService.SeedKnowledgeBaseFromFilesAsync();
                return Ok(new { Message = "Successfully seeded materials and tutorials with embeddings." });
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message, Stack = ex.StackTrace });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string type = "material")
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            if (type.ToLower() == "tutorial")
            {
                var tutorials = await _knowledgeService.SearchTutorialsAsync(query);
                return Ok(tutorials);
            }
            
            var materials = await _knowledgeService.SearchMaterialsAsync(query);
            return Ok(materials);
        }
    }
}
