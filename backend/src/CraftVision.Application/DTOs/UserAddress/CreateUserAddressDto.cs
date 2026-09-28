using System.ComponentModel.DataAnnotations;

namespace CraftVision.Application.DTOs.UserAddress
{
    public class CreateUserAddressDto
    {
        [Required]
        public string ReceiverName { get; set; } = string.Empty;
        
        [Required]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string Province { get; set; } = string.Empty;
        
        [Required]
        public string District { get; set; } = string.Empty;
        
        public bool IsDefault { get; set; }
    }
}
