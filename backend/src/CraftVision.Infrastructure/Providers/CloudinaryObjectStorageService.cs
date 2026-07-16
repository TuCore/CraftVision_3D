using System;
using System.IO;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Providers;
using Microsoft.Extensions.Configuration;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace CraftVision.Infrastructure.Providers
{
    public class CloudinaryObjectStorageService : IObjectStorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly string _uploadFolder;

        public CloudinaryObjectStorageService(IConfiguration configuration)
        {
            var cloudName = configuration["CloudinarySettings:CloudName"];
            var apiKey = configuration["CloudinarySettings:ApiKey"];
            var apiSecret = configuration["CloudinarySettings:ApiSecret"];
            _uploadFolder = configuration["CloudinarySettings:UploadFolder"] ?? "craftvision/uploads";

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new InvalidOperationException("Cloudinary settings are not configured properly.");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(uniqueFileName, fileStream),
                Folder = _uploadFolder,
                UseFilename = true,
                UniqueFilename = false,
                Overwrite = true
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            // Extract the public ID from the URL
            // Format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<filename>.<ext>
            try
            {
                var uri = new Uri(fileUrl);
                var segments = uri.AbsolutePath.Split('/');
                // Find the index of "upload"
                int uploadIndex = Array.IndexOf(segments, "upload");
                if (uploadIndex != -1 && segments.Length > uploadIndex + 2)
                {
                    // Start from uploadIndex + 2 (skip the version segment e.g., v1234567)
                    // Then join the rest and remove extension
                    var pathSegments = segments.Skip(uploadIndex + 2).ToArray();
                    var publicIdWithExt = string.Join("/", pathSegments);
                    var publicId = Path.ChangeExtension(publicIdWithExt, null); // remove extension
                    
                    var deletionParams = new DeletionParams(publicId);
                    await _cloudinary.DestroyAsync(deletionParams);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to delete file from Cloudinary: {ex.Message}");
            }
        }
    }
}
