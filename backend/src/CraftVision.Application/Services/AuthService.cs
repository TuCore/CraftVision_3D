using CraftVision.Application.DTOs.Auth;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using Microsoft.Extensions.Configuration;

namespace CraftVision.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider,
        IConfiguration config)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var exists = await _userRepository.ExistsByEmailAsync(request.Email);
        if (exists)
            throw new Exception("Email đã tồn tại.");

        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Tier = UserTier.Free,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add default quota (5 limits)
        var quota = new UserQuota
        {
            User = user,
            DailyLimit = int.TryParse(_config["QuotaSettings:FreeDailyLimit"], out int limit) ? limit : 5,
            DailyRequestsUsed = 0,
            LastResetDate = DateTime.UtcNow.Date
        };

        _userRepository.Add(user);
        _userRepository.AddQuota(quota);
        await _unitOfWork.SaveChangesAsync();

        var token = _tokenProvider.GenerateJwtToken(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName ?? string.Empty
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || user.PasswordHash == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new Exception("Email hoặc mật khẩu không chính xác.");
        }

        var token = _tokenProvider.GenerateJwtToken(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName ?? string.Empty
        };
    }
}
