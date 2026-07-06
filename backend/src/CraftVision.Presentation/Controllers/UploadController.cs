using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Providers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IObjectStorageService _objectStorageService;

        public UploadController(IObjectStorageService objectStorageService)
        {
            _objectStorageService = objectStorageService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Basic validation
            var contentType = file.ContentType;
            if (!contentType.StartsWith("image/"))
            {
                return BadRequest("Only image files are allowed.");
            }

            try
            {
                using var stream = file.OpenReadStream();
                var fileUrl = await _objectStorageService.UploadFileAsync(stream, file.FileName, contentType);
                
                return Ok(new { Url = fileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
