using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.UserAddress;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Services
{
    public class UserAddressService : IUserAddressService
    {
        private readonly IUserAddressRepository _addressRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserAddressService(IUserAddressRepository addressRepository, IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<UserAddressDto>> GetUserAddressesAsync(Guid userId)
        {
            var addresses = await _addressRepository.GetByUserIdAsync(userId);
            return addresses.Select(a => new UserAddressDto
            {
                Id = a.Id,
                ReceiverName = a.ReceiverName,
                Phone = a.Phone,
                Address = a.Address,
                Province = a.Province,
                District = a.District,
                IsDefault = a.IsDefault
            });
        }

        public async Task<UserAddressDto> CreateAddressAsync(Guid userId, CreateUserAddressDto dto)
        {
            var existingAddresses = await _addressRepository.GetByUserIdAsync(userId);
            bool isFirstAddress = !existingAddresses.Any();
            
            if (dto.IsDefault || isFirstAddress)
            {
                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                    _addressRepository.Update(addr);
                }
            }

            var newAddress = new UserAddress
            {
                UserId = userId,
                ReceiverName = dto.ReceiverName,
                Phone = dto.Phone,
                Address = dto.Address,
                Province = dto.Province,
                District = dto.District,
                IsDefault = dto.IsDefault || isFirstAddress,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _addressRepository.Add(newAddress);
            await _unitOfWork.SaveChangesAsync();

            return new UserAddressDto
            {
                Id = newAddress.Id,
                ReceiverName = newAddress.ReceiverName,
                Phone = newAddress.Phone,
                Address = newAddress.Address,
                Province = newAddress.Province,
                District = newAddress.District,
                IsDefault = newAddress.IsDefault
            };
        }

        public async Task<UserAddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateUserAddressDto dto)
        {
            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId) throw new Exception("Address not found");

            if (dto.ReceiverName != null) address.ReceiverName = dto.ReceiverName;
            if (dto.Phone != null) address.Phone = dto.Phone;
            if (dto.Address != null) address.Address = dto.Address;
            if (dto.Province != null) address.Province = dto.Province;
            if (dto.District != null) address.District = dto.District;

            address.UpdatedAt = DateTime.UtcNow;
            
            _addressRepository.Update(address);
            await _unitOfWork.SaveChangesAsync();

            return new UserAddressDto
            {
                Id = address.Id,
                ReceiverName = address.ReceiverName,
                Phone = address.Phone,
                Address = address.Address,
                Province = address.Province,
                District = address.District,
                IsDefault = address.IsDefault
            };
        }

        public async Task DeleteAddressAsync(Guid userId, Guid addressId)
        {
            var address = await _addressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId) throw new Exception("Address not found");

            _addressRepository.Remove(address);
            
            if (address.IsDefault)
            {
                var allAddresses = await _addressRepository.GetByUserIdAsync(userId);
                var anotherAddress = allAddresses.FirstOrDefault(a => a.Id != addressId);
                if (anotherAddress != null)
                {
                    anotherAddress.IsDefault = true;
                    _addressRepository.Update(anotherAddress);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task SetDefaultAddressAsync(Guid userId, Guid addressId)
        {
            var addresses = await _addressRepository.GetByUserIdAsync(userId);
            var targetAddress = addresses.FirstOrDefault(a => a.Id == addressId);
            
            if (targetAddress == null) throw new Exception("Address not found");

            foreach (var addr in addresses)
            {
                addr.IsDefault = addr.Id == addressId;
                _addressRepository.Update(addr);
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
