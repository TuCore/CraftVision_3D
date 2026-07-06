using System.IO;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces.Providers
{
    public interface IObjectStorageService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
        Task DeleteFileAsync(string fileUrl);
    }
}
