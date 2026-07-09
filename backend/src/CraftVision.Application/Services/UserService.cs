using CraftVision.Application.DTOs.User;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;

namespace CraftVision.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Phone = user.Phone,
            Bio = user.Bio,
            Tier = user.Tier.ToString(),
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateUserProfileDto request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new Exception("Người dùng không tồn tại.");

        user.FullName = request.FullName;
        user.DisplayName = request.DisplayName;
        user.Phone = request.Phone;
        user.Bio = request.Bio;
        user.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Phone = user.Phone,
            Bio = user.Bio,
            Tier = user.Tier.ToString(),
            CreatedAt = user.CreatedAt
        };
    }
}
