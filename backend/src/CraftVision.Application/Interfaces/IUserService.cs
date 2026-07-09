using CraftVision.Application.DTOs.User;

namespace CraftVision.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateUserProfileDto request);
}
