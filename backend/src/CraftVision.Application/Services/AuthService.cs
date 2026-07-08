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
    private readonly IEmailService _emailService;

    public AuthService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider,
        IConfiguration config,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
        _config = config;
        _emailService = emailService;
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

        try
        {
            _userRepository.Add(user);
            _userRepository.AddQuota(quota);
            await _unitOfWork.SaveChangesAsync();
        }
        catch (Exception)
        {
            throw new Exception("Email đã tồn tại hoặc có lỗi khi đăng ký.");
        }

        // Send welcome email asynchronously without blocking registration
        _ = _emailService.SendWelcomeEmailAsync(user.Email, user.FullName ?? "bạn");

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

    public async Task<AuthResponse> GoogleLoginAsync(GoogleLoginRequest request)
    {
        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { _config["GoogleClientId"] }
            };
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (Exception)
        {
            throw new Exception("Xác thực Google thất bại.");
        }

        var user = await _userRepository.GetByEmailAsync(payload.Email);
        if (user == null)
        {
            user = new User
            {
                Email = payload.Email,
                FullName = payload.Name,
                AuthProvider = "Google",
                ProviderId = payload.Subject,
                Tier = UserTier.Free,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var quota = new UserQuota
            {
                User = user,
                DailyLimit = int.TryParse(_config["QuotaSettings:FreeDailyLimit"], out int limit) ? limit : 5,
                DailyRequestsUsed = 0,
                LastResetDate = DateTime.UtcNow.Date
            };

            try
            {
                _userRepository.Add(user);
                _userRepository.AddQuota(quota);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception)
            {
                // Due to race condition, another request might have just created this user.
                // Refetch the user to proceed.
                user = await _userRepository.GetByEmailAsync(payload.Email);
                if (user == null) throw new Exception("Lỗi khi đăng nhập bằng Google.");
            }

            // Send welcome email asynchronously without blocking login
            _ = _emailService.SendWelcomeEmailAsync(user.Email, user.FullName ?? "bạn");
        }
        else if (string.IsNullOrEmpty(user.AuthProvider))
        {
            // Update existing user with Google Auth Info if they previously registered via email
            user.AuthProvider = "Google";
            user.ProviderId = payload.Subject;
            try { await _unitOfWork.SaveChangesAsync(); } catch { }
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
