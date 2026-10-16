using System.Text.Json;
using CraftVision.BuildingBlocks.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

[assembly: CollectionBehavior(DisableTestParallelization = true)]
namespace CraftVision.CardSharing.Tests;

public sealed class FakePaymentProvider : IPaymentProvider
{
    public string Status { get; set; } = "PENDING";
    public int Calls { get; private set; }
    public long Amount { get; set; }
    public long? PaidAmount { get; set; }
    public long OrderCode { get; set; }
    public string LinkId { get; set; } = "verified-link";
    public bool Fail { get; set; }
    public Task<PaymentLink> Create(long orderCode, int amount, string returnUrl, string cancelUrl, CancellationToken ct)
    {
        Calls++; Amount = amount; OrderCode = orderCode;
        if (Fail) throw new IOException("Provider unavailable");
        return Task.FromResult(new PaymentLink(LinkId, "https://pay.payos.vn/web/verified-link"));
    }
    public Task<PaymentReceipt> Get(long orderCode, CancellationToken ct) => Fail
        ? throw new IOException("Provider unavailable")
        : Task.FromResult(new PaymentReceipt(LinkId, OrderCode, Amount, PaidAmount ?? (Status == "PAID" ? Amount : 0), Status));
}

public sealed class PaymentTests
{
    [Fact] public async Task ForwardUpgradePreservesPopulatedLegacySchema()
    {
        var connection = Environment.GetEnvironmentVariable("CARDS_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection));
        var schema = "card_upgrade_" + Guid.NewGuid().ToString("N");
        var builder = new Npgsql.NpgsqlConnectionStringBuilder(connection) { SearchPath = schema };
        await using var db = new CardDatabase(new DbContextOptionsBuilder<CardDatabase>().UseNpgsql(builder.ConnectionString).Options);
        await db.Database.ExecuteSqlRawAsync($"CREATE SCHEMA {schema}");
        try
        {
            using var stream = typeof(CardDatabase).Assembly.GetManifestResourceStream("CardSharing.schema.sql")!;
            using var reader = new StreamReader(stream);
            await db.Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync());
            var id = Guid.NewGuid(); var owner = Guid.NewGuid(); var token = new string('b', 43);
            var draft = "{\"version\":1,\"template\":\"rose-love\",\"values\":{\"message\":\"Keep me\"}}";
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO \"Cards\" (\"Id\", \"OwnerId\", \"DraftJson\", \"PublishedJson\", \"ShareToken\", \"Revision\", \"UpdatedAt\", \"PublishedAt\") VALUES ({id}, {owner}, {draft}, {draft}, {token}, 3, {DateTime.UtcNow}, {DateTime.UtcNow})");
            await db.InitializeAsync();
            await db.InitializeAsync();
            var card = await db.Cards.SingleAsync();
            Assert.Equal(draft, card.DraftJson);
            Assert.Equal(token, card.ShareToken);
            Assert.Equal(3, card.Revision);
            Assert.Null(card.PaidAt);
            Assert.Null(CardService.View(card).SharePath);
        }
        finally
        {
            // Only this test's randomly named, isolated schema is removed.
            await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA {schema} CASCADE");
        }
    }

    [Fact] public void RequiresExactOrderAmountAndLinkAndFullSettlement()
    {
        var payment = new CardPayment { OrderCode = 123, Amount = 49000, LinkId = "link" };
        var receipt = new PaymentReceipt("link", 123, 49000, 49000, "PAID");
        Assert.True(CardPaymentService.IsFullyPaid(payment, receipt));
        Assert.False(CardPaymentService.IsFullyPaid(payment, receipt with { OrderCode = 124 }));
        Assert.False(CardPaymentService.IsFullyPaid(payment, receipt with { Id = "another-card" }));
        Assert.False(CardPaymentService.IsFullyPaid(payment, receipt with { Amount = 29000 }));
        Assert.False(CardPaymentService.IsFullyPaid(payment, receipt with { AmountPaid = 48999 }));
        Assert.False(CardPaymentService.IsFullyPaid(payment, receipt with { Status = "PENDING" }));
        Assert.Equal(49000, CardPrices.For("rose-love"));
        Assert.Equal(29000, CardPrices.For("birthday-wish"));
        Assert.Equal(39000, CardPrices.For("heart-key"));
        Assert.Throws<CardError>(() => CardPrices.For("not-a-card"));
    }

    [Fact] public async Task UnpaidLegacyLinksAndMediaAreBlockedAndOnlyVerifiedPaymentUnlocksPublication()
    {
        var connection = Environment.GetEnvironmentVariable("CARDS_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection));
        await using var db = new CardDatabase(new DbContextOptionsBuilder<CardDatabase>().UseNpgsql(connection).Options);
        await db.InitializeAsync();
        var owner = Guid.NewGuid();
        var service = new CardService(db, new CardValidator());
        var provider = new FakePaymentProvider();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["FrontendUrl"] = "http://localhost:3000" }).Build();
        var payments = new CardPaymentService(db, service, provider, config);
        var ct = CancellationToken.None;
        try
        {
            var draft = JsonSerializer.SerializeToElement(new { version = 1, template = "rose-love", values = new { recipient = "Friend", sender = "Me", message = "Hello" } });
            var created = await service.Create(owner, draft, ct);
            var card = await service.Find(owner, created.Id, ct);
            card.ShareToken = new string('a', 43); card.PublishedJson = card.DraftJson; card.PublishedAt = DateTime.UtcNow;
            var asset = new StoredAsset { OwnerId = owner, ContentType = "image/png", StorageUrl = "https://example.invalid", Hash = Guid.NewGuid().ToString() };
            db.Assets.Add(asset); db.PublishedAssets.Add(new PublishedAsset { CardId = card.Id, AssetId = asset.Id });
            await db.SaveChangesAsync();
            await db.InitializeAsync();
            Assert.Null(CardService.View(card).SharePath);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => service.Public(card.ShareToken, ct))).Status);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => new CardMedia(db, config).Get(asset.Id, null, ct))).Status);
            Assert.Equal(402, (await Assert.ThrowsAsync<CardError>(() => service.Publish(owner, card.Id, card.Revision, false, ct))).Status);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => payments.Checkout(Guid.NewGuid(), card.Id, ct))).Status);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => payments.Status(Guid.NewGuid(), card.Id, ct))).Status);

            var checkout = await payments.Checkout(owner, card.Id, ct);
            Assert.Equal(49000, checkout.Amount);
            Assert.Equal("PENDING", checkout.Status);
            Assert.Equal(checkout, await payments.Checkout(owner, card.Id, ct));
            Assert.Equal(1, provider.Calls);
            var firstOrder = provider.OrderCode;
            provider.Status = "CANCELLED";
            await payments.Checkout(owner, card.Id, ct);
            Assert.NotEqual(firstOrder, provider.OrderCode);
            provider.Status = "PAID"; provider.PaidAmount = 1000;
            Assert.Equal("PENDING", (await payments.Status(owner, card.Id, ct)).Status);
            Assert.Null(card.PaidAt);
            provider.PaidAmount = null;
            var rightOrder = provider.OrderCode;
            provider.OrderCode++;
            Assert.Equal(503, (await Assert.ThrowsAsync<CardError>(() => payments.Status(owner, card.Id, ct))).Status);
            Assert.Null(card.PaidAt);
            provider.OrderCode = rightOrder; provider.Fail = true;
            Assert.Equal(503, (await Assert.ThrowsAsync<CardError>(() => payments.Status(owner, card.Id, ct))).Status);
            Assert.Null(card.PaidAt);
            provider.Fail = false;
            Assert.Equal("PAID", (await payments.Status(owner, card.Id, ct)).Status);
            var paidAt = card.PaidAt;
            Assert.Equal("PAID", (await payments.Status(owner, card.Id, ct)).Status);
            Assert.Equal(paidAt, card.PaidAt);
            Assert.NotNull((await service.Publish(owner, card.Id, card.Revision, false, ct)).SharePath);
            var second = await service.Create(owner, draft, ct);
            Assert.Equal(402, (await Assert.ThrowsAsync<CardError>(() => service.Publish(owner, second.Id, second.Revision, false, ct))).Status);
        }
        finally
        {
            var ids = await db.Cards.Where(c => c.OwnerId == owner).Select(c => c.Id).ToArrayAsync();
            await db.PublishedAssets.Where(p => ids.Contains(p.CardId)).ExecuteDeleteAsync();
            await db.Payments.Where(p => ids.Contains(p.CardId)).ExecuteDeleteAsync();
            await db.Cards.Where(c => c.OwnerId == owner).ExecuteDeleteAsync();
            await db.Assets.Where(a => a.OwnerId == owner).ExecuteDeleteAsync();
        }
    }
}
