using CraftVision.Application.DTOs.Mobile;

namespace CraftVision.Application.Interfaces.Services;

public interface IFavoriteService
{
    Task<IReadOnlyList<FavoriteDto>> GetAsync(Guid userId);
    Task<FavoriteDto> AddAsync(Guid userId, Guid productId);
    Task RemoveAsync(Guid userId, Guid productId);
}

public interface IVoucherService
{
    Task<VoucherValidationDto> ValidateAsync(VoucherValidationRequest request);
}

public interface IShippingService
{
    IReadOnlyList<ShippingMethodDto> GetMethods();
    ShippingMethodDto Quote(ShippingQuoteRequest request);
}

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> GetAsync(Guid userId, bool unreadOnly);
    Task MarkReadAsync(Guid userId, Guid notificationId);
    Task MarkAllReadAsync(Guid userId);
    Task RegisterPushTokenAsync(Guid userId, RegisterPushTokenRequest request);
}

public interface IPasswordResetService
{
    Task RequestAsync(string email);
    Task ResetAsync(string token, string newPassword);
}

public interface IPaymentService
{
    Task<PaymentDto> CreateAsync(Guid userId, CreatePaymentRequest request);
    Task<PaymentDto> GetStatusAsync(Guid userId, Guid orderId);
}
