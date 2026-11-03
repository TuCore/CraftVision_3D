using CraftVision.Application.DTOs.Cart;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using CraftVision.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Tests;

public sealed class CartTrackingTests
{
    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task AddingProductToCartInsertsItemInsteadOfUpdatingMissingRow(bool cartAlreadyExists)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        await using var db = new CartTestContext(options);
        var user = new User { FullName = "Cart test", Email = "cart@example.test", PasswordHash = "test" };
        var category = new ProductCategory { Name = "Cart test", Slug = "cart-test" };
        var product = new Product { Name = "Cart product", Price = 100000, Stock = 10, ProductCategory = category, RowVersion = [0] };
        db.AddRange(user, product);
        await db.SaveChangesAsync();
        var service = new CartService(db);
        if (cartAlreadyExists) await service.GetCartAsync(user.Id);
        var cart = await service.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 2 });
        Assert.Equal(2, Assert.Single(cart.Items).Quantity);
        var updated = await service.AddItemAsync(user.Id, new AddToCartDto { ProductId = product.Id, Quantity = 3, SelectedOptions = "updated-card" });
        Assert.Equal(3, Assert.Single(updated.Items).Quantity);
        Assert.Equal("updated-card", Assert.Single(updated.Items).SelectedOptions);
    }

    private sealed class CartTestContext(DbContextOptions<ApplicationDbContext> options) : ApplicationDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<KnowledgeMaterial>().Ignore(m => m.Embedding);
            modelBuilder.Entity<KnowledgeTutorial>().Ignore(m => m.Embedding);
        }
    }
}
