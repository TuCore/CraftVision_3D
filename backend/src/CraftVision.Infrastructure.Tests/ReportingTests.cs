using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Application.Services;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using CraftVision.Gateway;
using CraftVision.Infrastructure.Data;
using CraftVision.Infrastructure.Repositories;
using CraftVision.Reporting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Npgsql;
using Npgsql.NameTranslation;
using Pgvector.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Tests;

public sealed class ReportingTests
{
    private const string Secret = "local-reporting-test-key-longer-than-thirty-two-bytes";

    [Theory]
    [InlineData("=SUM(A1)")]
    [InlineData("+123")]
    [InlineData("-cmd")]
    [InlineData("@lookup")]
    [InlineData("\t=1")]
    public void CsvNeutralizesSpreadsheetFormulas(string cell) => Assert.StartsWith("\"'", ReportSeries.CsvCell(cell));

    [Fact]
    public void LocalBoundariesAndZeroFilledSeriesAreConsistent()
    {
        var request = new ReportRequest { From = new(2026, 10, 1), To = new(2026, 10, 3) };
        var window = request.Window();
        Assert.Equal(new DateTime(2026, 9, 30, 17, 0, 0, DateTimeKind.Utc), window.Start);
        var series = ReportSeries.Build(window, "day", [new(new DateTime(2026, 10, 2), 100, 25, 75, 0)], []);
        Assert.Equal(3, series.Count); Assert.Equal(75, series.Sum(r => r.Revenue)); Assert.Equal(0, series[0].Revenue);
        Assert.Equal(75, Assert.Single(ReportSeries.Build(window, "month", [new(new DateTime(2026, 10, 2), 100, 25, 75, 0)], [])).Revenue);
        Assert.Throws<ReportError>(() => new ReportRequest { From = new(2025, 1, 1), To = new(2026, 10, 1) }.Window());
    }

    [Fact]
    public async Task PopulatedMigrationFinancialLifecycleAndGatewayReportsStayConsistent()
    {
        var connection = Environment.GetEnvironmentVariable("REPORTING_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection), "Set REPORTING_TEST_CONNECTION to a disposable local PostgreSQL database.");
        var keep = Environment.GetEnvironmentVariable("REPORTING_TEST_KEEP_SCHEMA") == "1";
        var schema = keep ? "reporting_preview" : "reporting_test_" + Guid.NewGuid().ToString("N");
        var cs = new NpgsqlConnectionStringBuilder(connection) { SearchPath = schema }.ConnectionString;
        await using var db = new ApplicationDbContext(Options(cs));
#pragma warning disable EF1002
        // This fixed test prefix/generated GUID exists only inside the explicitly configured disposable test database.
        if (keep) await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA IF EXISTS {schema} CASCADE");
        await db.Database.ExecuteSqlRawAsync($"CREATE SCHEMA {schema}");
        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
            var request = new ReportRequest { From = today, To = today };
            var start = request.Window().Start;
            var user = new User { FullName = "Reporting Customer", Email = "reporting@example.test", CreatedAt = start };
            var category = new ProductCategory { Name = "Reporting Gifts", Slug = "reporting-gifts" };
            var product = new Product { Name = "Original gift name", Price = 100000, Stock = 10, ProductCategory = category, RowVersion = [0] };
            // The pre-upgrade commerce schema omits only unrelated vector embeddings: PostgreSQL need not install pgvector to exercise commerce reporting.
            await using (var legacy = new LegacyCommerceContext(Options(cs)))
            {
                await legacy.Database.ExecuteSqlRawAsync(legacy.Database.GenerateCreateScript());
                await legacy.Database.OpenConnectionAsync();
                await ((NpgsqlConnection)legacy.Database.GetDbConnection()).ReloadTypesAsync();
                legacy.AddRange(user, category, product);
                legacy.Orders.AddRange(
                    new Order { UserId = user.Id, OrderCode = "legacy-paid", PaymentStatus = PaymentStatus.Paid, TotalAmount = 120000, CreatedAt = start.AddDays(-10) },
                    new Order { UserId = user.Id, OrderCode = "legacy-refund", PaymentStatus = PaymentStatus.Refunded, TotalAmount = 60000, CreatedAt = start.AddDays(-10) },
                    new Order { UserId = user.Id, OrderCode = "legacy-card", OrderKind = "DigitalCard", CardTemplateSlug = "rose-love", PaymentStatus = PaymentStatus.Paid, TotalAmount = 40000, CreatedAt = start.AddDays(-10) });
                await legacy.SaveChangesAsync();
            }
            // Baseline an already deployed schema, then run the actual new EF migration against populated data.
            await db.Database.ExecuteSqlRawAsync("CREATE TABLE \"__EFMigrationsHistory\" (migration_id varchar(150) PRIMARY KEY, product_version varchar(32) NOT NULL)");
            foreach (var migration in db.Database.GetMigrations().Where(id => !id.EndsWith("AddAdminRevenueReporting")))
                await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO \"__EFMigrationsHistory\" VALUES ({migration}, {"10.0.9"})");
            await db.Database.MigrateAsync();
            await db.Database.MigrateAsync();
            await db.Database.OpenConnectionAsync();
            await ((NpgsqlConnection)db.Database.GetDbConnection()).ReloadTypesAsync();
            Assert.Equal(4, await db.OrderFinancialEvents.CountAsync());
            Assert.Equal(3, await db.OrderFinancialEvents.CountAsync(e => e.OccurredAt == null));
            Assert.Null((await db.Orders.SingleAsync(o => o.OrderCode == "legacy-paid")).PaidAt);
            Assert.Equal(start.AddDays(-10), (await db.Orders.SingleAsync(o => o.OrderCode == "legacy-card")).PaidAt);
            db.ChangeTracker.Clear();

            var current = new Order { UserId = user.Id, OrderCode = "=test-safe-export", TotalAmount = 220000, ShippingFee = 20000,
                CreatedAt = start.AddDays(-2), PaymentStatus = PaymentStatus.Paid, PaidAt = start,
                OrderItems = [new() { ProductId = product.Id, Quantity = 2, UnitPrice = 100000, SubTotal = 200000, Product = await db.Products.SingleAsync() }] };
            current.FinancialEvents.Add(OrderFinancialEvent.Receipt(current, start));
            var previous = new Order { UserId = user.Id, OrderCode = "previous", TotalAmount = 200000, PaymentStatus = PaymentStatus.Refunded, CreatedAt = start.AddDays(-1) };
            var priorReceipt = OrderFinancialEvent.Receipt(previous, start.AddHours(-1));
            previous.FinancialEvents.Add(priorReceipt); previous.FinancialEvents.Add(priorReceipt.Refund(start.AddHours(1)));
            var card = new Order { UserId = user.Id, OrderCode = "new-card", OrderKind = "DigitalCard", CardTemplateSlug = "rose-love",
                TotalAmount = 50000, PaymentStatus = PaymentStatus.Paid, CreatedAt = start.AddHours(2) };
            card.FinancialEvents.Add(OrderFinancialEvent.Receipt(card, start.AddHours(2)));
            db.AddRange(current, previous, card); await db.SaveChangesAsync();
            var reports = new CommerceReports(db, new ConfigurationBuilder().Build());
            var summary = await reports.Summary(request, default);
            Assert.Equal(50000, summary.Current.Revenue); Assert.Equal(2, summary.Current.PaidOrders);
            Assert.Equal(2, summary.Current.ProductsSold); Assert.Equal(1, summary.Current.CardsSold);
            Assert.Equal(1, summary.Current.Buyers); Assert.Equal(1, summary.Current.Orders);
            Assert.Equal(20000, summary.Current.Shipping); Assert.Equal(120000, summary.UnknownNetRevenue);
            var revenue = await reports.Revenue(request, default);
            Assert.Equal(summary.Current.Revenue, revenue.Series.Sum(p => p.Revenue));
            Assert.Equal(summary.Current.Revenue, revenue.Composition.Sum(p => p.Value));
            var top = await reports.TopSelling(request, default);
            Assert.Equal(2, Assert.Single(top.Products).Quantity); Assert.Equal(50000, Assert.Single(top.Cards).Revenue);
            var exports = new List<SalesExportRow>();
            await foreach (var row in reports.Export(request, default)) exports.Add(row);
            Assert.Equal(summary.Current.Revenue, exports.Sum(row => row.Merchandise));
            var productOnly = await reports.Summary(new ReportRequest { From = today, To = today, Kind = "Product", Method = "Cod" }, default);
            Assert.Equal(0, productOnly.Current.Revenue); Assert.Equal(0, productOnly.Current.CardsSold);
            foreach (var metric in new[] { "revenue", "orders", "paidOrders", "productsSold", "cardsSold", "buyers", "legacy", "pending", "refundPending", "customers", "newCustomers", "products", "lowStock", "nfc" })
                await reports.Details(request, metric, 1, default);
            await reports.SetThreshold(product.Id, 15, default);
            Assert.Equal(1, (await reports.System(request, default)).LowStock);
            await reports.SetThreshold(product.Id, 0, default);
            Assert.Equal(0, (await reports.System(request, default)).LowStock);

            var repo = new OrderRepository(db);
            var work = new Mock<IUnitOfWork>();
            work.SetupGet(w => w.Orders).Returns(repo);
            work.SetupGet(w => w.Users).Returns(new UserRepository(db));
            work.SetupGet(w => w.Products).Returns(new ProductRepository(db));
            work.Setup(w => w.SaveChangesAsync(It.IsAny<CancellationToken>())).Returns((CancellationToken ct) => db.SaveChangesAsync(ct));
            work.Setup(w => w.BeginTransactionAsync(It.IsAny<CancellationToken>())).Returns(async (CancellationToken ct) => { await db.Database.BeginTransactionAsync(ct); });
            work.Setup(w => w.CommitTransactionAsync(It.IsAny<CancellationToken>())).Returns(async (CancellationToken ct) => { var tx = db.Database.CurrentTransaction!; await db.Database.CommitTransactionAsync(ct); await tx.DisposeAsync(); });
            work.Setup(w => w.RollbackTransactionAsync(It.IsAny<CancellationToken>())).Returns(async (CancellationToken ct) => { var tx = db.Database.CurrentTransaction; if (tx is not null) { await db.Database.RollbackTransactionAsync(ct); await tx.DisposeAsync(); } });
            var service = new OrderService(work.Object, new ConfigurationBuilder().Build(), Mock.Of<IPayOSService>());
            await service.DeleteOrderAsync(current.Id);
            Assert.Equal(summary.Current.Revenue, (await reports.Summary(request, default)).Current.Revenue);
            Assert.DoesNotContain((await repo.GetAllAsync(1, 100)).Items, o => o.Id == current.Id);
            await service.UpdatePaymentStatusAsync(current.Id, "Refunded");
            await service.UpdatePaymentStatusAsync(current.Id, "Refunded");
            Assert.Equal(1, await db.OrderFinancialEvents.CountAsync(e => e.OrderId == current.Id && e.Kind == "Refund"));
            Assert.Equal(-150000, (await reports.Summary(request, default)).Current.Revenue);
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdatePaymentStatusAsync(current.Id, "Unpaid"));
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdatePaymentStatusAsync(current.Id, "Paid"));

            var unpaid = new Order { UserId = user.Id, OrderCode = "confirm-payment", TotalAmount = 100000,
                OrderItems = [new() { ProductId = product.Id, Product = await db.Products.SingleAsync(), Quantity = 1, UnitPrice = 100000, SubTotal = 100000 }] };
            db.Orders.Add(unpaid); await db.SaveChangesAsync();
            await service.UpdatePaymentStatusAsync(unpaid.Id, "Paid");
            await service.UpdatePaymentStatusAsync(unpaid.Id, "Paid");
            Assert.Equal(1, await db.OrderFinancialEvents.CountAsync(e => e.OrderId == unpaid.Id));
            var mirroredId = Guid.NewGuid();
            await service.RecordPaidCardPurchaseAsync(user.Id, mirroredId, 123456789, 49000, "rose-love", start.AddHours(3));
            await service.RecordPaidCardPurchaseAsync(user.Id, mirroredId, 123456789, 49000, "rose-love", start.AddHours(3));
            Assert.Equal(1, await db.OrderFinancialEvents.CountAsync(e => e.OrderId == mirroredId));
            await db.Products.Where(p => p.Id == product.Id).ExecuteUpdateAsync(s => s.SetProperty(p => p.Name, "Renamed gift").SetProperty(p => p.Price, 999999));
            Assert.Equal("Original gift name", (await reports.TopSelling(request, default)).Products.Single().Name);
            db.Users.AddRange(Enumerable.Range(0, 21).Select(i => new User { FullName = $"Customer {i}", Email = $"c{i}@example.test", CreatedAt = start }));
            await db.SaveChangesAsync();
            Assert.Equal(2, (await reports.Details(request, "customers", 2, default)).Items.Count);

            var concurrent = new Order { UserId = user.Id, OrderCode = "concurrent", TotalAmount = 1000 };
            db.Orders.Add(concurrent); await db.SaveChangesAsync();
            await using (var first = new ApplicationDbContext(Options(cs)))
            await using (var second = new ApplicationDbContext(Options(cs)))
            {
                var firstRepo = new OrderRepository(first); var secondRepo = new OrderRepository(second);
                var a = (await firstRepo.GetByIdWithItemsAsync(concurrent.Id))!;
                var b = (await secondRepo.GetByIdWithItemsAsync(concurrent.Id))!;
                a.PaymentStatus = PaymentStatus.Paid; b.PaymentStatus = PaymentStatus.Paid;
                firstRepo.AddFinancialEvent(a, OrderFinancialEvent.Receipt(a, start)); firstRepo.Update(a);
                secondRepo.AddFinancialEvent(b, OrderFinancialEvent.Receipt(b, start)); secondRepo.Update(b);
                await first.SaveChangesAsync();
                await Assert.ThrowsAnyAsync<DbUpdateException>(() => second.SaveChangesAsync());
            }
            Assert.Equal(1, await db.OrderFinancialEvents.CountAsync(e => e.OrderId == concurrent.Id));
            db.NfcTags.AddRange(new NfcTag { TagCode = "REPORT-AVAILABLE", SecretKey = Guid.NewGuid().ToString("N") },
                new NfcTag { TagCode = "REPORT-ACTIVE", SecretKey = Guid.NewGuid().ToString("N"), Status = NfcStatus.Active });
            await db.SaveChangesAsync();

            await using var app = await Start(cs);
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
            var query = $"from={today:yyyy-MM-dd}&to={today:yyyy-MM-dd}";
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/api/admin/dashboard/summary?{query}")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync($"/api/admin/reports/sales/export?{query}")).StatusCode);
            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Customer"));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/admin/dashboard/summary?{query}")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync($"/api/admin/dashboard/stock-threshold/{product.Id}", new { threshold = 2 })).StatusCode);
            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            var response = await client.GetAsync($"/api/admin/dashboard/summary?{query}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode); Assert.Contains("no-store", response.Headers.CacheControl!.ToString());
            Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/admin/dashboard/summary?from=2025-01-01&to=2026-10-01")).StatusCode);
            var csv = await client.GetStringAsync($"/api/admin/reports/sales/export?{query}");
            Assert.Contains("\"'=test-safe-export\"", csv);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync("/api/admin/dashboard/cards")).StatusCode);
        }
        finally { if (!keep) await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA {schema} CASCADE"); }
#pragma warning restore EF1002
    }

    private static DbContextOptions<ApplicationDbContext> Options(string connection)
    {
        var translator = new NpgsqlNullNameTranslator();
        return new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connection, o =>
        {
            o.UseVector(); o.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
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

    private sealed class LegacyCommerceContext(DbContextOptions<ApplicationDbContext> options) : ApplicationDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder model)
        {
            base.OnModelCreating(model);
            model.Entity<KnowledgeMaterial>().Ignore(e => e.Embedding); model.Entity<KnowledgeTutorial>().Ignore(e => e.Embedding);
            model.Model.RemoveAnnotation("Npgsql:PostgresExtension:vector");
            model.Ignore<OrderFinancialLine>(); model.Ignore<OrderFinancialEvent>();
            model.Entity<Order>().Ignore(o => o.FinancialEvents).Ignore(o => o.PaidAt).Ignore(o => o.RefundedAt).Ignore(o => o.IsArchived).Ignore(o => o.Revision);
            model.Entity<Product>().Ignore(p => p.LowStockThreshold);
        }
    }

    private static async Task<WebApplication> Start(string connection)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing", Args = [] });
        builder.Services.AddScoped(_ => new ApplicationDbContext(Options(connection)));
        builder.Services.AddScoped<ICommerceReports, CommerceReports>(); builder.Services.AddScoped<ReportingErrorFilter>();
        builder.Services.AddControllers().AddApplicationPart(typeof(ReportingController).Assembly);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o => o.TokenValidationParameters = new()
        { ValidateIssuer = false, ValidateAudience = false, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)), ValidateIssuerSigningKey = true });
        builder.Services.AddAuthorization();
        var app = builder.Build(); app.Urls.Add("http://127.0.0.1:0");
        app.UseAuthentication(); app.UseAuthorization(); app.MapControllers(); await app.StartAsync(); return app;
    }
    private static string Token(string role) => new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(claims: [new(ClaimTypes.Role, role)],
        expires: DateTime.UtcNow.AddMinutes(10), signingCredentials: new(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)), SecurityAlgorithms.HmacSha256)));
}
