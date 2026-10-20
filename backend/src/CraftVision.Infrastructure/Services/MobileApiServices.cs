using System.Security.Cryptography;
using System.Text;
using CraftVision.Application.DTOs.Mobile;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Services;

public class CartService(ApplicationDbContext db) : ICartService
{
    public async Task<CartDto> GetAsync(Guid userId) => await BuildCartAsync(userId);

    public async Task<CartDto> AddAsync(Guid userId, CartItemRequest request)
    {
        if (request.Quantity is < 1 or > 99) throw new ArgumentException("Quantity must be between 1 and 99.");
        if (!await db.Products.AnyAsync(x => x.Id == request.ProductId)) throw new KeyNotFoundException("Product not found.");
        var item = await db.CartItems.FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == request.ProductId);
        if (item == null) db.CartItems.Add(new CartItem { UserId = userId, ProductId = request.ProductId, Quantity = request.Quantity });
        else { item.Quantity = Math.Min(99, item.Quantity + request.Quantity); item.UpdatedAt = DateTime.UtcNow; }
        await db.SaveChangesAsync();
        return await BuildCartAsync(userId);
    }

    public async Task<CartDto> UpdateAsync(Guid userId, Guid itemId, int quantity)
    {
        if (quantity is < 1 or > 99) throw new ArgumentException("Quantity must be between 1 and 99.");
        var item = await db.CartItems.FirstOrDefaultAsync(x => x.Id == itemId && x.UserId == userId)
            ?? throw new KeyNotFoundException("Cart item not found.");
        item.Quantity = quantity;
        item.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await BuildCartAsync(userId);
    }

    public async Task RemoveAsync(Guid userId, Guid itemId)
    {
        var item = await db.CartItems.FirstOrDefaultAsync(x => x.Id == itemId && x.UserId == userId)
            ?? throw new KeyNotFoundException("Cart item not found.");
        db.CartItems.Remove(item);
        await db.SaveChangesAsync();
    }

    public async Task ClearAsync(Guid userId)
    {
        await db.CartItems.Where(x => x.UserId == userId).ExecuteDeleteAsync();
    }

    private async Task<CartDto> BuildCartAsync(Guid userId)
    {
        var entities = await db.CartItems.AsNoTracking().Where(x => x.UserId == userId)
            .Include(x => x.Product).ThenInclude(x => x!.ProductImages).ThenInclude(x => x.File).ToListAsync();
        var items = entities.Select(x => new CartItemDto(x.Id, x.ProductId, x.Product!.Name, x.Product.Price,
            x.Quantity, x.Product.Price * x.Quantity,
            x.Product.ProductImages.FirstOrDefault(i => i.IsThumbnail)?.File?.FileUrl ?? x.Product.SampleImageUrl)).ToList();
        return new CartDto(items, items.Sum(x => x.Quantity), items.Sum(x => x.SubTotal));
    }
}

public class FavoriteService(ApplicationDbContext db) : IFavoriteService
{
    public async Task<IReadOnlyList<FavoriteDto>> GetAsync(Guid userId) => await db.Favorites.AsNoTracking()
        .Where(x => x.UserId == userId).Include(x => x.Product).ThenInclude(x => x!.ProductImages).ThenInclude(x => x.File)
        .OrderByDescending(x => x.CreatedAt)
        .Select(x => new FavoriteDto(x.Id, x.ProductId, x.Product!.Name, x.Product.Price,
            x.Product.ProductImages.Where(i => i.IsThumbnail).Select(i => i.File!.FileUrl).FirstOrDefault() ?? x.Product.SampleImageUrl,
            x.CreatedAt)).ToListAsync();

    public async Task<FavoriteDto> AddAsync(Guid userId, Guid productId)
    {
        var existing = await db.Favorites.Include(x => x.Product).FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId);
        if (existing != null) return new FavoriteDto(existing.Id, productId, existing.Product!.Name, existing.Product.Price, existing.Product.SampleImageUrl, existing.CreatedAt);
        var product = await db.Products.FindAsync(productId) ?? throw new KeyNotFoundException("Product not found.");
        var favorite = new Favorite { UserId = userId, ProductId = productId };
        db.Favorites.Add(favorite);
        await db.SaveChangesAsync();
        return new FavoriteDto(favorite.Id, productId, product.Name, product.Price, product.SampleImageUrl, favorite.CreatedAt);
    }

    public async Task RemoveAsync(Guid userId, Guid productId)
    {
        var favorite = await db.Favorites.FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId)
            ?? throw new KeyNotFoundException("Favorite not found.");
        db.Favorites.Remove(favorite);
        await db.SaveChangesAsync();
    }
}

public class VoucherService(ApplicationDbContext db) : IVoucherService
{
    public async Task<VoucherValidationDto> ValidateAsync(VoucherValidationRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var now = DateTime.UtcNow;
        var voucher = await db.Vouchers.AsNoTracking().FirstOrDefaultAsync(x => x.Code == code && x.IsActive && x.StartsAt <= now && x.EndsAt >= now);
        if (voucher == null) return new(false, "Voucher không tồn tại hoặc đã hết hạn.", 0, request.OrderAmount);
        if (request.OrderAmount < voucher.MinimumOrderAmount) return new(false, $"Đơn hàng tối thiểu {voucher.MinimumOrderAmount:N0}đ.", 0, request.OrderAmount);
        var discount = request.OrderAmount * voucher.DiscountPercent / 100m;
        if (voucher.MaximumDiscount.HasValue) discount = Math.Min(discount, voucher.MaximumDiscount.Value);
        return new(true, null, discount, Math.Max(0, request.OrderAmount - discount));
    }
}

public class ShippingService : IShippingService
{
    public IReadOnlyList<ShippingMethodDto> GetMethods() =>
    [new("standard", "Giao hàng tiêu chuẩn", 30000, 3), new("express", "Giao hàng nhanh", 50000, 1)];

    public ShippingMethodDto Quote(ShippingQuoteRequest request)
    {
        var isHcm = request.Province.Contains("Hồ Chí Minh", StringComparison.OrdinalIgnoreCase) || request.Province.Contains("HCM", StringComparison.OrdinalIgnoreCase);
        var fee = request.OrderAmount >= 500000 ? 0 : isHcm ? 25000 : 40000;
        return new("standard", "Giao hàng tiêu chuẩn", fee, isHcm ? 2 : 4);
    }
}

public class NotificationService(ApplicationDbContext db) : INotificationService
{
    public async Task<IReadOnlyList<NotificationDto>> GetAsync(Guid userId, bool unreadOnly) => await db.UserNotifications.AsNoTracking()
        .Where(x => x.UserId == userId && (!unreadOnly || !x.IsRead)).OrderByDescending(x => x.CreatedAt)
        .Select(x => new NotificationDto(x.Id, x.Title, x.Body, x.Type, x.IsRead, x.CreatedAt)).ToListAsync();

    public async Task MarkReadAsync(Guid userId, Guid notificationId)
    {
        var item = await db.UserNotifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId)
            ?? throw new KeyNotFoundException("Notification not found.");
        item.IsRead = true;
        await db.SaveChangesAsync();
    }

    public async Task MarkAllReadAsync(Guid userId)
    {
        await db.UserNotifications.Where(x => x.UserId == userId && !x.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRead, true));
    }

    public async Task RegisterPushTokenAsync(Guid userId, RegisterPushTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token)) throw new ArgumentException("Push token is required.");
        var item = await db.DevicePushTokens.FirstOrDefaultAsync(x => x.Token == request.Token);
        if (item == null) db.DevicePushTokens.Add(new DevicePushToken { UserId = userId, Token = request.Token.Trim(), Platform = request.Platform.Trim() });
        else { item.UserId = userId; item.Platform = request.Platform.Trim(); item.UpdatedAt = DateTime.UtcNow; }
        await db.SaveChangesAsync();
    }
}

public class PasswordResetService(ApplicationDbContext db, IPasswordHasher hasher, IEmailService emailService) : IPasswordResetService
{
    public async Task RequestAsync(string email)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email == email.Trim().ToLower());
        if (user == null) return;
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        db.PasswordResetTokens.Add(new PasswordResetToken { UserId = user.Id, TokenHash = Hash(rawToken), ExpiresAt = DateTime.UtcNow.AddMinutes(30) });
        await db.SaveChangesAsync();
        await emailService.SendEmailAsync(user.Email!, "Đặt lại mật khẩu CraftVision", $"Mã đặt lại mật khẩu của bạn: <strong>{rawToken}</strong>. Mã có hiệu lực 30 phút.");
    }

    public async Task ResetAsync(string token, string newPassword)
    {
        if (newPassword.Length < 8) throw new ArgumentException("Password must contain at least 8 characters.");
        var hash = Hash(token.Trim());
        var reset = await db.PasswordResetTokens.Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TokenHash == hash && x.UsedAt == null && x.ExpiresAt > DateTime.UtcNow)
            ?? throw new ArgumentException("Reset token is invalid or expired.");
        reset.User!.PasswordHash = hasher.HashPassword(newPassword);
        reset.User.UpdatedAt = DateTime.UtcNow;
        reset.UsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}

public class PaymentService(ApplicationDbContext db, IPayOSService payOs) : IPaymentService
{
    public async Task<PaymentDto> CreateAsync(Guid userId, CreatePaymentRequest request)
    {
        var order = await db.Orders.FirstOrDefaultAsync(x => x.Id == request.OrderId && x.UserId == userId)
            ?? throw new KeyNotFoundException("Order not found.");
        if (order.PaymentStatus == PaymentStatus.Paid) throw new InvalidOperationException("Order is already paid.");
        if (!long.TryParse(order.OrderCode, out var orderCode)) throw new InvalidOperationException("Order code is not valid for PayOS.");
        var url = await payOs.CreatePaymentLinkAsync(order.Id, orderCode, order.TotalAmount, "CraftVision order", request.ReturnUrl, request.CancelUrl);
        order.PaymentMethod = PaymentMethod.BankTransfer;
        await db.SaveChangesAsync();
        return new(order.Id, order.OrderCode, order.PaymentStatus.ToString(), url);
    }

    public async Task<PaymentDto> GetStatusAsync(Guid userId, Guid orderId)
    {
        var order = await db.Orders.AsNoTracking().FirstOrDefaultAsync(x => x.Id == orderId && x.UserId == userId)
            ?? throw new KeyNotFoundException("Order not found.");
        return new(order.Id, order.OrderCode, order.PaymentStatus.ToString(), null);
    }
}
