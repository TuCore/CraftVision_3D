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
        [RequestSizeLimit(5 * 1024 * 1024)] // Chặn ngay từ cửa nếu file > 5MB
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("Dung lượng file vượt quá giới hạn 5MB.");

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
