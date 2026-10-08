using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CraftVision.Music;

public sealed class MusicTrack
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = "";
    public string? SourceUrl { get; set; }
    public byte[]? AudioData { get; set; }
    public string? ContentType { get; set; }
    public bool IsEnabled { get; set; } = true;
    public int SortOrder { get; set; }
    public int Revision { get; set; } = 1;
    public int MediaVersion { get; set; } = 1;
}

public sealed class MusicDatabase(DbContextOptions<MusicDatabase> options) : DbContext(options)
{
    public DbSet<MusicTrack> Tracks => Set<MusicTrack>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        var track = model.Entity<MusicTrack>();
        track.ToTable("MusicTracks").HasKey(t => t.Id);
        track.Property(t => t.Title).HasMaxLength(120);
        track.Property(t => t.SourceUrl).HasMaxLength(2048);
        track.Property(t => t.ContentType).HasMaxLength(32);
        track.Property(t => t.Revision).IsConcurrencyToken();
    }

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        using var stream = typeof(MusicDatabase).Assembly.GetManifestResourceStream("Music.schema.sql")!;
        using var reader = new StreamReader(stream);
        await Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync(ct), ct);
    }
}

public static class MusicRegistration
{
    public static IServiceCollection AddMusic(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("Music");
        if (string.IsNullOrWhiteSpace(connection)) return services;
        services.AddDbContext<MusicDatabase>(options => options.UseNpgsql(connection));
        services.AddScoped<MusicService>();
        return services;
    }
}
