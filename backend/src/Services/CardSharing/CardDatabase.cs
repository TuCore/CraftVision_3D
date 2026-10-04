using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CraftVision.CardSharing;

public sealed class StoredCard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string DraftJson { get; set; } = "";
    public string? PublishedJson { get; set; }
    public string? ShareToken { get; set; }
    public int Revision { get; set; } = 1;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
}
public sealed class StoredAsset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerId { get; set; }
    public string StorageUrl { get; set; } = "";
    public string ContentType { get; set; } = "";
    public long Length { get; set; }
    public string Hash { get; set; } = "";
}
public sealed class PublishedAsset
{
    public Guid CardId { get; set; }
    public Guid AssetId { get; set; }
}
public sealed class CardDatabase(DbContextOptions<CardDatabase> options) : DbContext(options)
{
    public DbSet<StoredCard> Cards => Set<StoredCard>();
    public DbSet<StoredAsset> Assets => Set<StoredAsset>();
    public DbSet<PublishedAsset> PublishedAssets => Set<PublishedAsset>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<StoredCard>().ToTable("Cards").HasKey(x => x.Id);
        model.Entity<StoredCard>().Property(x => x.Revision).IsConcurrencyToken();
        model.Entity<StoredCard>().HasIndex(x => x.ShareToken).IsUnique();
        model.Entity<StoredAsset>().ToTable("Assets").HasKey(x => x.Id);
        model.Entity<StoredAsset>().HasIndex(x => new { x.OwnerId, x.Hash }).IsUnique();
        model.Entity<PublishedAsset>().ToTable("PublishedAssets").HasKey(x => new { x.CardId, x.AssetId });
        model.Entity<PublishedAsset>().HasOne<StoredCard>().WithMany().HasForeignKey(x => x.CardId);
        model.Entity<PublishedAsset>().HasOne<StoredAsset>().WithMany().HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
    }
    public async Task InitializeAsync(CancellationToken ct = default)
    {
        using var stream = typeof(CardDatabase).Assembly.GetManifestResourceStream("CardSharing.schema.sql")!;
        using var reader = new StreamReader(stream);
        await Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync(ct), ct);
    }
}
public static class CardRegistration
{
    public static IServiceCollection AddCardSharing(this IServiceCollection services, IConfiguration config)
    {
        var connection = config.GetConnectionString("Cards");
        if (string.IsNullOrWhiteSpace(connection)) return services;
        services.AddDbContext<CardDatabase>(o => o.UseNpgsql(connection));
        services.AddSingleton<CardValidator>();
        services.AddScoped<CardService>();
        services.AddScoped<CardMedia>();
        services.AddHttpClient("CardAssets", client => client.Timeout = TimeSpan.FromSeconds(30));
        return services;
    }
}
