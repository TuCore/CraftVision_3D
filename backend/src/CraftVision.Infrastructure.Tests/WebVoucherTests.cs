using CraftVision.Application.DTOs.Order;
using CraftVision.Application.DTOs.Vouchers;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Application.Services;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Infrastructure.Data;
using CraftVision.Infrastructure.Repositories;
using CraftVision.Vouchers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Npgsql;
using Npgsql.NameTranslation;

namespace CraftVision.Infrastructure.Tests;

public sealed class VoucherPostgresFactAttribute : FactAttribute
{
    public VoucherPostgresFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("VOUCHER_TEST_CONNECTION")))
            Skip = "Set VOUCHER_TEST_CONNECTION to an isolated local PostgreSQL test database.";
    }
}

public class WebVoucherTests
{
    [Fact]
    public void MigrationCompatibilityPreservesOriginalCartCreationAndIndexes()
    {
        using var db = new ApplicationDbContext(Options("Host=localhost;Database=voucher_test;Username=voucher_test;Password=voucher_test"));
        var generator = db.GetService<IMigrationsSqlGenerator>();
        var model = db.GetService<Microsoft.EntityFrameworkCore.Metadata.IDesignTimeModel>().Model;
        var original = new CraftVision.Infrastructure.Migrations.AddCartAndWishlist();
        var mobile = new CraftVision.Infrastructure.Migrations.AddMobileCommerceApis();
        var originalSql = string.Join("\n", generator.Generate(original.UpOperations, model).Select(c => c.CommandText));
        var mobileSql = string.Join("\n", generator.Generate(mobile.UpOperations, model).Select(c => c.CommandText));
        Assert.Contains("CREATE TABLE cart_items", originalSql);
        Assert.Contains("CREATE INDEX ix_cart_items_product_id", originalSql);
        Assert.Contains("ADD VALUE IF NOT EXISTS 'BankTransfer' BEFORE 'Cod'", mobileSql);
        Assert.Contains("Expected cart_items.cart_id", mobileSql);
        Assert.DoesNotContain("CREATE TABLE cart_items", mobileSql);
        Assert.DoesNotContain("ix_cart_items_user_id_product_id", mobileSql);
        // Reusing the scoped generator must not suppress a subsequent normal operation.
        Assert.Contains("CREATE INDEX ix_cart_items_product_id",
            string.Join("\n", generator.Generate(original.UpOperations, model).Select(c => c.CommandText)));
    }

    [Fact]
    public void RandomCodesHaveEightUnambiguousCharacters()
    {
        var codes = Enumerable.Range(0, 128).Select(_ => VoucherRules.GenerateCode()).ToArray();
        Assert.All(codes, code => Assert.Matches("^[A-HJ-NP-Z2-9]{8}$", code));
        Assert.Equal(codes.Length, codes.Distinct().Count());
    }

    [Theory]
    [InlineData(0)] [InlineData(101)]
    public void InvalidPercentages(int percent) => Assert.Throws<ArgumentException>(() => VoucherRules.ValidatePercent(percent));

    [Fact]
    public void WholeBillDiscountAndFinancialSnapshotsBalanceIncludingFullDiscount()
    {
        foreach (var percent in new[] { 1, 25, 99, 100 })
        {
            var quote = VoucherRules.Discount(new(200003, 35000, 235003, 0, 0, 0, 235003, null, 0, []), percent, "K7M9X2R8");
            var order = new Order { TotalAmount = quote.TotalAmount, ShippingFee = quote.ShippingFee,
                MerchandiseDiscount = quote.MerchandiseDiscount, ShippingDiscount = quote.ShippingDiscount,
                OrderItems = [new() { Quantity = 1, SubTotal = 1 }, new() { Quantity = 2, SubTotal = 200002 }] };
            var receipt = OrderFinancialEvent.Receipt(order, DateTime.UtcNow);
            Assert.Equal(quote.OriginalTotal, quote.TotalAmount + quote.DiscountAmount);
            Assert.Equal(quote.DiscountAmount, quote.MerchandiseDiscount + quote.ShippingDiscount);
            Assert.Equal(order.TotalAmount, receipt.MerchandiseAmount + receipt.ShippingAmount);
            Assert.Equal(receipt.MerchandiseAmount, receipt.Lines.Sum(l => l.Amount));
            Assert.All(receipt.Lines, l => Assert.True(l.Amount >= 0));
            var refund = receipt.Refund(DateTime.UtcNow);
            Assert.Equal(receipt.MerchandiseAmount, refund.MerchandiseAmount);
            Assert.Equal(receipt.Lines.Sum(l => l.Amount), refund.Lines.Sum(l => l.Amount));
        }
    }

    [Theory]
    [InlineData(PaymentStatus.Unpaid, OrderStatus.Pending, false, "Reserved")]
    [InlineData(PaymentStatus.Paid, OrderStatus.Shipped, false, "Reserved")]
    [InlineData(PaymentStatus.Unpaid, OrderStatus.Delivered, false, "Reserved")]
    [InlineData(PaymentStatus.Paid, OrderStatus.Delivered, false, "Used")]
    [InlineData(PaymentStatus.Unpaid, OrderStatus.Cancelled, false, "Reserved")]
    [InlineData(PaymentStatus.Unpaid, OrderStatus.Cancelled, true, "Released")]
    [InlineData(PaymentStatus.Paid, OrderStatus.Cancelled, true, "Reserved")]
    [InlineData(PaymentStatus.Refunded, OrderStatus.Cancelled, false, "Released")]
    public void UsageRequiresPaymentAndDeliveryAndVerifiedCancellation(PaymentStatus payment, OrderStatus status, bool closed, string expected)
    {
        var usage = new VoucherUsage();
        var order = new Order { PaymentStatus = payment, OrderStatus = status };
        VoucherRules.Transition(usage, order, closed, DateTime.UtcNow);
        Assert.Equal(expected, usage.Status);
        var revision = usage.Revision;
        VoucherRules.Transition(usage, order, closed, DateTime.UtcNow);
        Assert.Equal(revision, usage.Revision);
        if (expected == "Used")
        {
            order.PaymentStatus = PaymentStatus.Refunded; order.OrderStatus = OrderStatus.Cancelled;
            VoucherRules.Transition(usage, order, true, DateTime.UtcNow);
            Assert.Equal("Used", usage.Status);
        }
    }

    [Theory]
    [InlineData("TP. Thủ Đức, Hồ Chí Minh", 100000, 0)]
    [InlineData("Quận 1, Hồ Chí Minh", 100000, 20000)]
    [InlineData("Hà Nội", 100000, 35000)]
    [InlineData("Hà Nội", 500000, 0)]
    public void ShippingMatchesWebPolicy(string address, decimal subtotal, decimal expected) =>
        Assert.Equal(expected, OrderPricingService.Shipping(address, subtotal, true));

    [VoucherPostgresFact]
    public async Task PopulatedMigrationCapacityRacesAndOrderLifecycle()
    {
        var connection = Environment.GetEnvironmentVariable("VOUCHER_TEST_CONNECTION")!;
        var parsed = new NpgsqlConnectionStringBuilder(connection);
        Assert.Equal("voucher_test", parsed.Database);
        Assert.Contains(parsed.Host, new[] { "localhost", "127.0.0.1" });
        var schema = Environment.GetEnvironmentVariable("VOUCHER_TEST_SCHEMA") ?? "voucher_test_" + Guid.NewGuid().ToString("N");
        Assert.Matches("^voucher_[a-z0-9_]+$", schema);
        parsed.SearchPath = schema + ",public";
        var options = Options(parsed.ConnectionString);
        await using var db = new ApplicationDbContext(options);
#pragma warning disable EF1002
        await db.Database.ExecuteSqlRawAsync($"CREATE SCHEMA {schema}");
        try
        {
            var testPassword = BCrypt.Net.BCrypt.HashPassword("VoucherTest@123", 4);
            var users = Enumerable.Range(1, 8).Select(n => new User { FullName = $"Voucher Customer {n}", Email = $"voucher{n}@example.test",
                PasswordHash = testPassword }).ToArray();
            users[0].Role = UserRole.Admin;
            users[0].Email = "voucher-admin@example.test";
            var category = new ProductCategory { Name = "Voucher test gifts", Slug = "voucher-test" };
            var product = new Product { Name = "Voucher test gift", Price = 100000, Stock = 100, ProductCategory = category, RowVersion = [0] };
            var legacyOrder = new Order { UserId = users[0].Id, OrderCode = "legacy-voucher-test", TotalAmount = 123000, ReceiverName = "Legacy customer" };
            var legacyCart = new Cart { UserId = users[1].Id };
            var legacyCartItem = new CartItem { CartId = legacyCart.Id, ProductId = product.Id, Quantity = 2, SelectedOptions = "preserve-cart-data" };
            await using (var legacy = new LegacyVoucherContext(options))
            {
                await legacy.Database.ExecuteSqlRawAsync(legacy.Database.GenerateCreateScript());
                await legacy.Database.OpenConnectionAsync();
                await ((NpgsqlConnection)legacy.Database.GetDbConnection()).ReloadTypesAsync();
                legacy.AddRange(users); legacy.AddRange(category, product, legacyOrder, legacyCart, legacyCartItem);
                await legacy.SaveChangesAsync();
            }
            // Reproduce an existing database stopped before AddMobileCommerceApis:
            // BankTransfer and the original cart schema already exist, with live cart data.
            await db.Database.ExecuteSqlRawAsync("DROP TABLE device_push_tokens, favorites, password_reset_tokens, user_notifications, vouchers");
            await db.Database.ExecuteSqlRawAsync("CREATE TABLE \"__EFMigrationsHistory\" (migration_id varchar(150) PRIMARY KEY, product_version varchar(32) NOT NULL)");
            foreach (var migration in db.Database.GetMigrations().Where(m => !m.EndsWith("AddWebVoucherReservations") && !m.EndsWith("AddMobileCommerceApis") && !m.EndsWith("RandomizeWebVoucherCodes")))
                await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO \"__EFMigrationsHistory\" VALUES ({migration}, {"10.0.9"})");
            await db.GetService<IMigrator>().MigrateAsync("20261103064222_AddWebVoucherReservations");
            var oldWebVoucher = new Voucher { Code = "MA20%", DiscountPercent = 20, CustomerLimit = 3, EndsAt = DateTime.UtcNow.AddYears(1) };
            var mobileVoucher = new Voucher { Code = "MOBILE20", DiscountPercent = 20, EndsAt = DateTime.UtcNow.AddYears(1) };
            db.Vouchers.AddRange(oldWebVoucher, mobileVoucher);
            await db.SaveChangesAsync();
            await db.Database.MigrateAsync(); await db.Database.MigrateAsync();
            await db.Entry(oldWebVoucher).ReloadAsync();
            await db.Entry(mobileVoucher).ReloadAsync();
            Assert.Matches("^[A-HJ-NP-Z2-9]{8}$", oldWebVoucher.Code);
            Assert.Equal(20, oldWebVoucher.DiscountPercent);
            Assert.Equal(3, oldWebVoucher.CustomerLimit);
            Assert.Equal("MOBILE20", mobileVoucher.Code);
            db.Vouchers.Remove(oldWebVoucher);
            await db.SaveChangesAsync();
            await db.Database.OpenConnectionAsync();
            await ((NpgsqlConnection)db.Database.GetDbConnection()).ReloadTypesAsync();
            Assert.Equal(123000, (await db.Orders.SingleAsync(o => o.Id == legacyOrder.Id)).TotalAmount);
            Assert.Equal(0, (await db.Orders.SingleAsync(o => o.Id == legacyOrder.Id)).DiscountAmount);
            Assert.Equal("preserve-cart-data", (await db.CartItems.SingleAsync(c => c.Id == legacyCartItem.Id)).SelectedOptions);
            Assert.Equal(2, (await db.CartItems.SingleAsync(c => c.Id == legacyCartItem.Id)).Quantity);
            Assert.False((await db.Database.GetPendingMigrationsAsync()).Any());

            var closed = false;
            var pay = new Mock<IPayOSService>();
            pay.Setup(p => p.CloseUnpaidPaymentAsync(It.IsAny<long>(), It.IsAny<decimal>())).ReturnsAsync(() => closed);
            pay.Setup(p => p.VerifyPaymentAsync(It.IsAny<long>(), It.IsAny<decimal>())).ReturnsAsync(true);
            pay.Setup(p => p.CreatePaymentLinkAsync(It.IsAny<Guid>(), It.IsAny<long>(), It.IsAny<decimal>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(("https://pay.payos.vn/web/local-test", "local-qr", "", "", "", 0, "local"));
            var services = new ServiceCollection().AddLogging();
            services.AddScoped(_ => new ApplicationDbContext(options));
            services.AddSingleton<IConfiguration>(new ConfigurationBuilder().Build());
            services.AddSingleton(pay.Object);
            foreach (var type in typeof(UnitOfWork).Assembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Repository")))
                foreach (var contract in type.GetInterfaces().Where(t => t.Name == "I" + type.Name)) services.AddScoped(contract, type);
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IOrderPricingService, OrderPricingService>();
            services.AddScoped<IWebVoucherService, VoucherService>();
            services.AddScoped<IOrderService, OrderService>();
            await using var provider = services.BuildServiceProvider();
            using var adminScope = provider.CreateScope();
            var admin = adminScope.ServiceProvider.GetRequiredService<IWebVoucherService>();
            var voucher = await admin.CreateAsync(users[0].Id, new(25, 1, null, true));
            Assert.Matches("^[A-HJ-NP-Z2-9]{8}$", voucher.Code);
            await Assert.ThrowsAsync<VoucherError>(() => admin.CreateAsync(users[0].Id, new(25, 1, null, true)));

            CreateOrderDto Request(string? code = null, string method = "Cod") => new() { PricingVersion = 1,
                ReceiverName = "Test Customer", ReceiverPhone = "0900000000", ReceiverAddress = "Hà Nội", PaymentMethod = method,
                ShippingFee = -999999, VoucherCode = code ?? voucher.Code, Items = [new() { ProductId = product.Id, Quantity = 1, CardType = "none", ExtraPrice = 0 }] };
            var quote = await admin.QuoteAsync(users[1].Id, Request());
            Assert.Equal(101250, quote.TotalAmount); Assert.Equal(33750, quote.DiscountAmount);
            Assert.Equal(0, (await admin.ListAsync()).Single().Reserved);
            async Task<OrderDto?> Attempt(Guid user)
            {
                using var scope = provider.CreateScope();
                try { return await scope.ServiceProvider.GetRequiredService<IOrderService>().CreateOrderAsync(user, Request()); }
                catch (ArgumentException) { return null; }
            }
            var race = await Task.WhenAll(Attempt(users[1].Id), Attempt(users[2].Id));
            var winner = Assert.Single(race, o => o is not null)!;
            Assert.Equal(101250, winner.TotalAmount); Assert.Equal("Reserved", winner.VoucherUsageStatus);
            Assert.Equal(1, (await admin.ListAsync()).Single().Reserved);
            using (var scope = provider.CreateScope())
            {
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                await orders.UpdateOrderStatusAsync(winner.Id, "Shipped");
                var user = (await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Orders.FindAsync(winner.Id))!.UserId;
                await orders.CompleteUserOrderAsync(user, winner.Id);
                Assert.Equal("Reserved", (await orders.GetOrderByIdAsync(winner.Id)).VoucherUsageStatus);
                await orders.UpdatePaymentStatusAsync(winner.Id, "Paid");
                await orders.UpdatePaymentStatusAsync(winner.Id, "Paid");
                var completed = await orders.GetOrderByIdAsync(winner.Id);
                Assert.Equal("Used", completed.VoucherUsageStatus); Assert.Equal("Delivered", completed.OrderStatus);
                var eventRow = await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().OrderFinancialEvents.Include(e => e.Lines).SingleAsync(e => e.OrderId == winner.Id);
                Assert.Equal(completed.TotalAmount, eventRow.MerchandiseAmount + eventRow.ShippingAmount);
                Assert.Equal(eventRow.MerchandiseAmount, eventRow.Lines.Sum(l => l.Amount));
            }
            voucher = (await admin.ListAsync()).Single();
            await Assert.ThrowsAsync<ArgumentException>(() => admin.UpdateAsync(voucher.Id, new(25, 0, null, true, voucher.Revision)));
            voucher = await admin.UpdateAsync(voucher.Id, new(25, 3, null, true, voucher.Revision));
            using (var scope = provider.CreateScope())
            {
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                var paidFirst = await orders.CreateOrderAsync(users[5].Id, Request());
                await Assert.ThrowsAsync<ArgumentException>(() => admin.QuoteAsync(users[5].Id, Request()));
                await Assert.ThrowsAsync<VoucherError>(() => admin.UpdateAsync(voucher.Id, new(25, 1, null, true, voucher.Revision)));
                await orders.UpdatePaymentStatusAsync(paidFirst.Id, "Paid");
                Assert.Equal("Reserved", (await orders.GetOrderByIdAsync(paidFirst.Id)).VoucherUsageStatus);
                await orders.UpdateOrderStatusAsync(paidFirst.Id, "Shipped");
                await orders.CompleteUserOrderAsync(users[5].Id, paidFirst.Id);
                Assert.Equal("Used", (await orders.GetOrderByIdAsync(paidFirst.Id)).VoucherUsageStatus);
            }
            using (var scope = provider.CreateScope())
            {
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                var unpaid = await orders.CreateOrderAsync(users[3].Id, Request(method: "BankTransfer"));
                await orders.CancelUserOrderAsync(users[3].Id, unpaid.Id);
                Assert.Equal("Reserved", (await orders.GetOrderByIdAsync(unpaid.Id)).VoucherUsageStatus);
                // A payment arriving during cancellation becomes refund-pending, never lost or fulfilled.
                Assert.True(await orders.CheckAndUpdatePaymentStatusAsync(unpaid.Id));
                var late = await orders.GetOrderByIdAsync(unpaid.Id);
                Assert.Equal("Cancelled", late.OrderStatus); Assert.Equal("Paid", late.PaymentStatus);
                Assert.Equal("Reserved", late.VoucherUsageStatus);
                await orders.UpdatePaymentStatusAsync(unpaid.Id, "Refunded");
                Assert.Equal("Released", (await orders.GetOrderByIdAsync(unpaid.Id)).VoucherUsageStatus);
                unpaid = await orders.CreateOrderAsync(users[3].Id, Request(method: "BankTransfer"));
                await orders.CancelUserOrderAsync(users[3].Id, unpaid.Id);
                closed = true;
                await scope.ServiceProvider.GetRequiredService<IWebVoucherService>().ExpireAsync();
                // Once expiry is reached, only provider-confirmed closure releases capacity.
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var usage = await context.VoucherUsages.SingleAsync(u => u.OrderId == unpaid.Id);
                usage.ExpiresAt = DateTime.UtcNow.AddMinutes(-1); await context.SaveChangesAsync();
                await scope.ServiceProvider.GetRequiredService<IWebVoucherService>().ExpireAsync();
                context.ChangeTracker.Clear();
                Assert.Equal("Released", (await context.VoucherUsages.SingleAsync(u => u.OrderId == unpaid.Id)).Status);
                await Assert.ThrowsAsync<InvalidOperationException>(() => orders.GetOrRegeneratePaymentLinkAsync(unpaid.Id));
            }
            var full = await admin.CreateAsync(users[0].Id, new(100, 5, null, true));
            using (var scope = provider.CreateScope())
            {
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                var free = await orders.CreateOrderAsync(users[4].Id, Request(full.Code, "BankTransfer"));
                Assert.Equal(0, free.TotalAmount); Assert.Equal("Paid", free.PaymentStatus); Assert.Null(free.CheckoutUrl);
            }
            using (var scope = provider.CreateScope())
            {
                var orders = scope.ServiceProvider.GetRequiredService<IOrderService>();
                var certificateRequest = Request(full.Code);
                certificateRequest.Items[0].WantNfc = true;
                certificateRequest.Items[0].Gift = new() { GiftTitle = "Certificate", Theme = "craft-certificate", MessageSource = "System" };
                var certificateOrder = await orders.CreateOrderAsync(users[0].Id, certificateRequest);
                Assert.NotNull(certificateOrder.Items.Single().Gift?.SecretKey);
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var originalGift = await context.Gifts.SingleAsync(g => g.OrderItemId == certificateOrder.Items.Single().Id);
                var originalTag = originalGift.NfcTagId;
                await orders.CancelUserOrderAsync(users[0].Id, certificateOrder.Id);
                // Reproduce historical cancelled orders whose tag is Available but still has a gift.
                certificateRequest.VoucherCode = null;
                var replacementOrder = await orders.CreateOrderAsync(users[0].Id, certificateRequest);
                var replacementGift = await context.Gifts.SingleAsync(g => g.OrderItemId == replacementOrder.Items.Single().Id);
                Assert.NotEqual(originalTag, replacementGift.NfcTagId);
                Assert.Equal(originalTag, (await context.Gifts.SingleAsync(g => g.Id == originalGift.Id)).NfcTagId);

                // Multiple certificate items must claim different available tags before SaveChanges.
                context.NfcTags.AddRange(
                    new NfcTag { TagCode = "UNASSIGNED-A", SecretKey = Guid.NewGuid().ToString("N") },
                    new NfcTag { TagCode = "UNASSIGNED-B", SecretKey = Guid.NewGuid().ToString("N") });
                await context.SaveChangesAsync();
                certificateRequest.Items.Add(new() { ProductId = product.Id, Quantity = 1, CardType = "none", WantNfc = true,
                    Gift = new() { GiftTitle = "Second certificate", Theme = "craft-certificate", MessageSource = "System" } });
                var multiple = await orders.CreateOrderAsync(users[0].Id, certificateRequest);
                var itemIds = multiple.Items.Select(i => i.Id).ToArray();
                var tags = await context.Gifts.Where(g => itemIds.Contains(g.OrderItemId)).Select(g => g.NfcTagId).ToArrayAsync();
                Assert.Equal(2, tags.Distinct().Count());
            }
            Assert.Equal(2, (await admin.UsagesAsync(voucher.Id, 1)).Items.Count(u => u.Status == "Used"));
        }
        finally
        {
            if (Environment.GetEnvironmentVariable("VOUCHER_TEST_KEEP_SCHEMA") != "1")
                await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA {schema} CASCADE");
        }
#pragma warning restore EF1002
    }

    internal static DbContextOptions<ApplicationDbContext> Options(string connection)
    {
        var translator = new NpgsqlNullNameTranslator();
        return new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connection, o =>
        {
            o.UseVector();
            o.MapEnum<UserTier>("user_tier_enum", nameTranslator: translator); o.MapEnum<FileType>("file_type_enum", nameTranslator: translator);
            o.MapEnum<MessageRole>("message_role_enum", nameTranslator: translator); o.MapEnum<RequestStatus>("request_status_enum", nameTranslator: translator);
            o.MapEnum<Difficulty>("difficulty_enum", nameTranslator: translator); o.MapEnum<OptionLevel>("option_level_enum", nameTranslator: translator);
            o.MapEnum<MaterialUnit>("material_unit_enum", nameTranslator: translator); o.MapEnum<OrderStatus>("order_status_enum", nameTranslator: translator);
            o.MapEnum<PaymentMethod>("payment_method_enum", nameTranslator: translator); o.MapEnum<PaymentStatus>("payment_status_enum", nameTranslator: translator);
            o.MapEnum<NfcStatus>("nfc_status_enum", nameTranslator: translator); o.MapEnum<MediaType>("media_type_enum", nameTranslator: translator);
            o.MapEnum<GiftStatus>("gift_status_enum", nameTranslator: translator); o.MapEnum<MessageSource>("message_source_enum", nameTranslator: translator);
            o.MapEnum<ProductType>("product_type_enum", nameTranslator: translator); o.MapEnum<ModelType>("model_type_enum", nameTranslator: translator);
        }).UseSnakeCaseNamingConvention().Options;
    }

    private sealed class LegacyVoucherContext(DbContextOptions<ApplicationDbContext> options) : ApplicationDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder model)
        {
            base.OnModelCreating(model);
            model.Ignore<VoucherUsage>();
            model.Entity<Order>().Ignore(o => o.VoucherUsage).Ignore(o => o.VoucherCode).Ignore(o => o.DiscountPercent)
                .Ignore(o => o.DiscountAmount).Ignore(o => o.OriginalTotal).Ignore(o => o.MerchandiseDiscount).Ignore(o => o.ShippingDiscount);
            model.Entity<Voucher>().Ignore(v => v.CustomerLimit).Ignore(v => v.CreatedAt).Ignore(v => v.CreatedBy).Ignore(v => v.Revision);
        }
    }
}
