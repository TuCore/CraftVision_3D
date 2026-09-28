using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories
{
    public class UserAddressRepository : IUserAddressRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public UserAddressRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId)
        {
            return await _dbContext.UserAddresses
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserAddress?> GetByIdAsync(Guid id)
        {
            return await _dbContext.UserAddresses.FirstOrDefaultAsync(a => a.Id == id);
        }

        public void Add(UserAddress address)
        {
            _dbContext.UserAddresses.Add(address);
        }

        public void Update(UserAddress address)
        {
            _dbContext.UserAddresses.Update(address);
        }

        public void Remove(UserAddress address)
        {
            _dbContext.UserAddresses.Remove(address);
        }
    }
}
