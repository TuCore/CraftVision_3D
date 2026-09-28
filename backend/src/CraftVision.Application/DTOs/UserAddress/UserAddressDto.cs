using System;

namespace CraftVision.Application.DTOs.UserAddress
{
    public class UserAddressDto
    {
        public Guid Id { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
