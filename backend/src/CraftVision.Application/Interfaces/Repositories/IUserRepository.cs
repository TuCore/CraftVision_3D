using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> ExistsByEmailAsync(string email);
    void Add(User user);
    void Update(User user);
    void AddQuota(UserQuota quota);
}
