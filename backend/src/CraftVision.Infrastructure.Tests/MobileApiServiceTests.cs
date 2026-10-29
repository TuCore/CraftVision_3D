using System.Text.RegularExpressions;
using CraftVision.Application.DTOs.Cart;
using CraftVision.Application.DTOs.Mobile;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using CraftVision.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace CraftVision.Infrastructure.Tests;

public class MobileApiServiceTests
{
    [Fact]
    public async Task Cart_AddingSameProductAndOptions_UpdatesQuantity()
    {
        await using var db = CreateDb();
        var (user, product) = await SeedProductAsync(db, 125_000m);
        var service = new CartService(db);

        await service.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 2 });
        var cart = await service.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 1 });

        Assert.Single(cart.Items);
        Assert.Equal(1, cart.Items[0].Quantity);
        Assert.Equal(125_000m, cart.Items[0].Price);
        Assert.Equal(10, cart.Items[0].Stock);
        Assert.False(cart.Items[0].IsOutOfStock);
    }

    [Fact]
    public async Task Cart_UpdateWithZeroQuantity_RemovesItem()
    {
        await using var db = CreateDb();
        var (user, product) = await SeedProductAsync(db, 125_000m);
        var service = new CartService(db);
        var cart = await service.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 2 });

        var updatedCart = await service.UpdateItemAsync(
            user.Id,
            cart.Items.Single().Id,
            new UpdateCartItemDto { Quantity = 0 });

        Assert.Empty(updatedCart.Items);
    }

    [Fact]
    public async Task Favorite_AddingSameProduct_IsIdempotent()
    {
        await using var db = CreateDb();
        var (user, product) = await SeedProductAsync(db, 90_000m);
        var service = new FavoriteService(db);

        var first = await service.AddAsync(user.Id, product.Id);
        var second = await service.AddAsync(user.Id, product.Id);

        Assert.Equal(first.Id, second.Id);
        Assert.Single(await service.GetAsync(user.Id));
    }

    [Fact]
    public async Task Voucher_ValidCode_CapsMaximumDiscount()
    {
        await using var db = CreateDb();
        db.Vouchers.Add(new Voucher
        {
            Code = "SAVE20", DiscountPercent = 20, MaximumDiscount = 50_000,
            MinimumOrderAmount = 100_000, StartsAt = DateTime.UtcNow.AddDays(-1), EndsAt = DateTime.UtcNow.AddDays(1)
        });
        await db.SaveChangesAsync();

        var result = await new VoucherService(db).ValidateAsync(new("save20", 500_000));

        Assert.True(result.IsValid);
        Assert.Equal(50_000m, result.DiscountAmount);
        Assert.Equal(450_000m, result.FinalAmount);
    }

    [Fact]
    public async Task Voucher_ExpiredCode_IsInvalid()
    {
        await using var db = CreateDb();
        db.Vouchers.Add(new Voucher
        {
            Code = "OLD", DiscountPercent = 10, StartsAt = DateTime.UtcNow.AddDays(-2), EndsAt = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync();

        var result = await new VoucherService(db).ValidateAsync(new("OLD", 500_000));

        Assert.False(result.IsValid);
        Assert.Equal(0m, result.DiscountAmount);
    }

    [Fact]
    public void Shipping_LargeOrder_IsFree()
    {
        var result = new ShippingService().Quote(new("Đà Nẵng", "Hải Châu", 500_000));

        Assert.Equal(0m, result.Fee);
        Assert.Equal(4, result.EstimatedDays);
    }

    [Fact]
    public async Task Notification_MarkRead_OnlyUpdatesOwnersNotification()
    {
        await using var db = CreateDb();
        var ownerId = Guid.NewGuid();
        var notification = new UserNotification { UserId = ownerId, Title = "Order", Body = "Ready", Type = "order" };
        db.UserNotifications.Add(notification);
        await db.SaveChangesAsync();
        var service = new NotificationService(db);

        await service.MarkReadAsync(ownerId, notification.Id);

        Assert.True((await service.GetAsync(ownerId, false)).Single().IsRead);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.MarkReadAsync(Guid.NewGuid(), notification.Id));
    }

    [Fact]
    public async Task PasswordReset_ValidToken_ChangesPasswordAndCannotBeReused()
    {
        await using var db = CreateDb();
        var user = new User { Email = "customer@example.com", PasswordHash = "old" };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        var email = new Mock<IEmailService>();
        string? body = null;
        email.Setup(x => x.SendEmailAsync(user.Email!, It.IsAny<string>(), It.IsAny<string>(), true))
            .Callback<string, string, string, bool>((_, _, value, _) => body = value)
            .Returns(Task.CompletedTask);
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(x => x.HashPassword("New-password1!")).Returns("new-hash");
        var service = new PasswordResetService(db, hasher.Object, email.Object);

        await service.RequestAsync("CUSTOMER@example.com");
        var token = Regex.Match(body!, "[A-F0-9]{64}").Value;
        await service.ResetAsync(token, "New-password1!");

        Assert.Equal("new-hash", user.PasswordHash);
        await Assert.ThrowsAsync<ArgumentException>(() => service.ResetAsync(token, "Another-password2!"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Short1!")]
    [InlineData("lowercase1!")]
    [InlineData("UPPERCASE1!")]
    [InlineData("NoNumbers!")]
    [InlineData("NoSpecial1")]
    public async Task PasswordReset_WeakPassword_DoesNotChangeUserOrConsumeToken(string? password)
    {
        await using var db = CreateDb();
        const string token = "local-policy-test-token";
        var user = new User { Email = "reset-policy@example.test", PasswordHash = "old-hash" };
        var reset = new PasswordResetToken
        {
            User = user,
            TokenHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token))),
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
        db.AddRange(user, reset);
        await db.SaveChangesAsync();
        var hasher = new Mock<IPasswordHasher>(MockBehavior.Strict);
        var service = new PasswordResetService(db, hasher.Object, new Mock<IEmailService>().Object);

        await Assert.ThrowsAsync<ArgumentException>(() => service.ResetAsync(token, password!));

        Assert.Equal("old-hash", (await db.Users.SingleAsync()).PasswordHash);
        Assert.Null((await db.PasswordResetTokens.SingleAsync()).UsedAt);
        hasher.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Payment_Status_DoesNotExposeAnotherUsersOrder()
    {
        await using var db = CreateDb();
        var ownerId = Guid.NewGuid();
        var order = new Order { UserId = ownerId, OrderCode = "12345", TotalAmount = 200_000 };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        var payOs = new Mock<IPayOSService>();
        var service = new PaymentService(db, payOs.Object);

        var ownStatus = await service.GetStatusAsync(ownerId, order.Id);

        Assert.Equal(order.Id, ownStatus.OrderId);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetStatusAsync(Guid.NewGuid(), order.Id));
    }

    private static ApplicationDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new MobileApiTestDbContext(options);
    }

    private static async Task<(User User, Product Product)> SeedProductAsync(ApplicationDbContext db, decimal price)
    {
        var user = new User { Email = $"{Guid.NewGuid()}@example.com" };
        var category = new ProductCategory { Name = "Gift", Slug = $"gift-{Guid.NewGuid()}" };
        var product = new Product { Name = "Custom gift", Price = price, Stock = 10, ProductCategory = category, RowVersion = [1] };
        db.AddRange(user, category, product);
        await db.SaveChangesAsync();
        return (user, product);
    }

    private sealed class MobileApiTestDbContext(DbContextOptions<ApplicationDbContext> options)
        : ApplicationDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<KnowledgeMaterial>().Ignore(x => x.Embedding);
            modelBuilder.Entity<KnowledgeTutorial>().Ignore(x => x.Embedding);
        }
    }
}
