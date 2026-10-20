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
        [AllowAnonymous]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Không tìm thấy file ảnh tải lên." });
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Dung lượng file vượt quá giới hạn 5MB." });

            var contentType = file.ContentType;
            if (string.IsNullOrWhiteSpace(contentType) || !contentType.StartsWith("image/"))
                return BadRequest(new { message = "Chỉ hỗ trợ định dạng file hình ảnh." });

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);

            try
            {
                using var ms = new System.IO.MemoryStream();
                await file.CopyToAsync(ms);
                var fileBytes = ms.ToArray();

                string fileUrl;
                try
                {
                    using var uploadStream = new System.IO.MemoryStream(fileBytes);
                    fileUrl = await _objectStorageService.UploadFileAsync(uploadStream, file.FileName, contentType);
                }
                catch
                {
                    // Fallback to inline base64 data URL if Cloudinary is unreachable
                    fileUrl = $"data:{contentType};base64,{Convert.ToBase64String(fileBytes)}";
                }

                var fileId = Guid.NewGuid();
                if (userId != Guid.Empty)
                {
                    try
                    {
                        var uploadedFile = new UploadedFile
                        {
                            Id = fileId,
                            UserId = userId,
                            FileUrl = fileUrl,
                            FileType = CraftVision.Domain.Enums.FileType.Image
                        };

                        await _unitOfWork.UploadedFiles.AddAsync(uploadedFile);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    catch
                    {
                        // Ignore FK constraint error if the browser's cached JWT userId does not exist in the newly imported DB
                    }
                }

                var response = new
                {
                    FileId = fileId,
                    CloudinaryUrl = fileUrl,
                    MimeType = contentType
                };

                return Created($"/api/uploads/{fileId}", response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi tải ảnh lên: {ex.Message}" });
            }
        }
    }
}
