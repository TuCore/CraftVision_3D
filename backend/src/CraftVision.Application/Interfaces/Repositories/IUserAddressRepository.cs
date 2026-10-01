using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories
{
    public interface IUserAddressRepository
    {
        Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId);
        Task<UserAddress?> GetByIdAsync(Guid id);
        void Add(UserAddress address);
        void Update(UserAddress address);
        void Remove(UserAddress address);
    }
}
