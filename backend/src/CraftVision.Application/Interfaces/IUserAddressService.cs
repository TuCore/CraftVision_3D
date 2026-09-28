using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.UserAddress;

namespace CraftVision.Application.Interfaces
{
    public interface IUserAddressService
    {
        Task<IEnumerable<UserAddressDto>> GetUserAddressesAsync(Guid userId);
        Task<UserAddressDto> CreateAddressAsync(Guid userId, CreateUserAddressDto dto);
        Task<UserAddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateUserAddressDto dto);
        Task DeleteAddressAsync(Guid userId, Guid addressId);
        Task SetDefaultAddressAsync(Guid userId, Guid addressId);
    }
}
