using System.Text.Json;
using CraftVision.CardSharing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CraftVision.CardSharing.Tests;

public sealed class SharingTests
{
    private static JsonElement Draft(string message = "Hello", string photo = "") => JsonSerializer.SerializeToElement(new { version = 1, template = "rose-love", values = new { recipient = "Friend", sender = "Me", message, photo } });
    [Fact] public void RejectsUnknownTemplateAndExternalMedia()
    {
        var validator = new CardValidator();
        Assert.Empty(validator.Validate(Draft()));
        Assert.Throws<CardError>(() => validator.Validate(Draft(photo: "https://example.org/x.jpg")));
        Assert.Throws<CardError>(() => validator.Validate(Draft(photo: "data:image/png;base64,AAAA")));
        Assert.Throws<CardError>(() => validator.Validate(JsonSerializer.SerializeToElement(new { version = 1, template = "unknown", values = new { } })));
        Assert.Throws<CardError>(() => validator.Validate(Draft(message: "")));
    }
    [Fact] public void DetectsMediaFromBytesInsteadOfClaimedExtension()
    {
        Assert.Equal("image/png", CardMedia.Detect([137,80,78,71,13,10,26,10,0,0,0,0]));
        Assert.Equal("audio/wav", CardMedia.Detect("RIFF0000WAVE"u8.ToArray()));
        Assert.Throws<CardError>(() => CardMedia.Detect("<html>fake image</html>"u8.ToArray()));
    }
    [Fact] public async Task PublicationIsolatedOwnershipConcurrencyRevocationAndPopulatedStartup()
    {
        var connection = Environment.GetEnvironmentVariable("CARDS_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection), "Set CARDS_TEST_CONNECTION to a dedicated local PostgreSQL database.");
        var options = new DbContextOptionsBuilder<CardDatabase>().UseNpgsql(connection).Options;
        await using var db = new CardDatabase(options);
        await db.InitializeAsync();
        var owner = Guid.NewGuid(); var outsider = Guid.NewGuid();
        var service = new CardService(db, new CardValidator());
        var media = new CardMedia(db, new ConfigurationBuilder().Build());
        var ct = CancellationToken.None;
        try
        {
            var asset = new StoredAsset { OwnerId = owner, StorageUrl = "https://example.invalid/private", ContentType = "image/png", Length = 12, Hash = Guid.NewGuid().ToString("N") };
            db.Assets.Add(asset); await db.SaveChangesAsync();
            var reference = $"/api/cards/media/{asset.Id}";
            var created = await service.Create(owner, Draft(photo: reference), ct);
            Assert.Null(created.SharePath);
            Assert.Empty(await service.List(outsider, ct));
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => service.Find(outsider, created.Id, ct))).Status);
            Assert.Equal(400, (await Assert.ThrowsAsync<CardError>(() => service.Create(outsider, Draft(photo: reference), ct))).Status);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => media.Get(asset.Id, null, ct))).Status);
            Assert.Equal(asset.Id, (await media.Get(asset.Id, owner, ct)).Id);
            await db.InitializeAsync(); // Existing populated rows survive startup initialization.
            Assert.Equal(created.Id, (await service.Find(owner, created.Id, ct)).Id);
            var published = await service.Publish(owner, created.Id, created.Revision, false, ct);
            var token = published.SharePath!.Split('/').Last();
            Assert.Equal(43, token.Length);
            Assert.Equal(asset.Id, (await media.Get(asset.Id, null, ct)).Id);
            var edited = await service.Update(owner, created.Id, published.Revision, Draft("Unpublished changes"), ct);
            Assert.Equal("Hello", (await service.Public(token, ct)).GetProperty("values").GetProperty("message").GetString());
            Assert.Equal(409, (await Assert.ThrowsAsync<CardError>(() => service.Publish(owner, created.Id, published.Revision, false, ct))).Status);
            var updated = await service.Publish(owner, created.Id, edited.Revision, false, ct);
            Assert.Equal(published.SharePath, updated.SharePath);
            Assert.Equal("Unpublished changes", (await service.Public(token, ct)).GetProperty("values").GetProperty("message").GetString());
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => media.Get(asset.Id, null, ct))).Status);
            var revoked = await service.Publish(owner, created.Id, updated.Revision, true, ct);
            Assert.Null(revoked.SharePath);
            Assert.Equal(404, (await Assert.ThrowsAsync<CardError>(() => service.Public(token, ct))).Status);
            var again = await service.Publish(owner, created.Id, revoked.Revision, false, ct);
            Assert.NotEqual(published.SharePath, again.SharePath);
            // Two independent connections race on the same revision; only one may win.
            await using var competingDb = new CardDatabase(options);
            var competitor = new CardService(competingDb, new CardValidator());
            await competitor.Find(owner, created.Id, ct);
            await service.Update(owner, created.Id, again.Revision, Draft("Winner"), ct);
            Assert.Equal(409, (await Assert.ThrowsAsync<CardError>(() => competitor.Update(owner, created.Id, again.Revision, Draft("Stale"), ct))).Status);
        }
        finally
        {
            var ids = await db.Cards.Where(c => c.OwnerId == owner || c.OwnerId == outsider).Select(c => c.Id).ToArrayAsync();
            await db.PublishedAssets.Where(p => ids.Contains(p.CardId)).ExecuteDeleteAsync();
            await db.Cards.Where(c => c.OwnerId == owner || c.OwnerId == outsider).ExecuteDeleteAsync();
            await db.Assets.Where(a => a.OwnerId == owner || a.OwnerId == outsider).ExecuteDeleteAsync();
        }
    }
}
