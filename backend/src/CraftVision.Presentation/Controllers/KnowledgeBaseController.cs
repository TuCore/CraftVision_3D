using System;
using System.IO;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Application.Interfaces.Providers;
using Microsoft.AspNetCore.Mvc;
using Pgvector;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/knowledge-base")]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly IKnowledgeRetrievalService _knowledgeService;
        private readonly IEmbeddingProvider _embeddingProvider;

        public KnowledgeBaseController(IKnowledgeRetrievalService knowledgeService, IEmbeddingProvider embeddingProvider)
        {
            _knowledgeService = knowledgeService;
            _embeddingProvider = embeddingProvider;
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
                return StatusCode(500, new { 
                    Error = ex.Message, 
                    InnerError = ex.InnerException?.Message, 
                    Stack = ex.StackTrace 
                });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] string type = "material")
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var vectorArray = await _embeddingProvider.GenerateEmbeddingAsync(query);
            var queryVector = new Vector(vectorArray);

            if (type.ToLower() == "tutorial")
            {
                var tutorials = await _knowledgeService.SearchTutorialsAsync(queryVector);
                return Ok(tutorials);
            }
            
            var materials = await _knowledgeService.SearchMaterialsAsync(queryVector);
            return Ok(materials);
        }
    }
}
