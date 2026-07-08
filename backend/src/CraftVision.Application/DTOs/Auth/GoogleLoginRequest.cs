using System.ComponentModel.DataAnnotations;

namespace CraftVision.Application.DTOs.Auth
{
    public class GoogleLoginRequest
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
