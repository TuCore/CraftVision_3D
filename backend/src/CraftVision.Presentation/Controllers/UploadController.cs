using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [Route("api/uploads")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IObjectStorageService _objectStorageService;
        private readonly IUnitOfWork _unitOfWork;

        public UploadController(IObjectStorageService objectStorageService, IUnitOfWork unitOfWork)
        {
            _objectStorageService = objectStorageService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            if (file.Length > 5 * 1024 * 1024) return BadRequest("Dung lượng file vượt quá giới hạn 5MB.");

            var contentType = file.ContentType;
            if (!contentType.StartsWith("image/")) return BadRequest("Only image files are allowed.");

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            try
            {
                using var stream = file.OpenReadStream();
                var fileUrl = await _objectStorageService.UploadFileAsync(stream, file.FileName, contentType);
                
                var uploadedFile = new UploadedFile
                {
                    UserId = userId,
                    FileUrl = fileUrl,
                    FileType = CraftVision.Domain.Enums.FileType.Image
                };
                
                await _unitOfWork.UploadedFiles.AddAsync(uploadedFile);
                await _unitOfWork.SaveChangesAsync();

                var response = new 
                {
                    FileId = uploadedFile.Id,
                    CloudinaryUrl = uploadedFile.FileUrl,
                    MimeType = contentType
                };

                return Created($"/api/uploads/{uploadedFile.Id}", response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
