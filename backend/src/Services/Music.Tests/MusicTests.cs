using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using CraftVision.Gateway;
using CraftVision.Music;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace CraftVision.Music.Tests;

public class MusicTests
{
    private const string Secret = "local-music-test-signing-key-at-least-32-bytes-long";

    [Theory]
    [InlineData("", "https://example.com/song.mp3")]
    [InlineData("  ", "https://example.com/song.mp3")]
    [InlineData("Song", "http://example.com/song.mp3")]
    [InlineData("Song", "javascript:alert(1)")]
    [InlineData("Song", "https://user:password@example.com/song.mp3")]
    [InlineData("Song", "https://localhost/song.mp3")]
    [InlineData("Song", "")]
    public void InvalidMetadataIsRejected(string title, string url) =>
        Assert.Equal(400, Assert.Throws<MusicError>(() => MusicValidation.Validate(new(title, url, true, 0, 0), true)).Status);

    [Fact]
    public void InvalidOrOversizedAudioIsRejected()
    {
        Assert.Throws<MusicError>(() => MusicValidation.ContentType("<script>alert(1)</script>"u8.ToArray()));
        Assert.Equal(413, Assert.Throws<MusicError>(() => MusicValidation.ContentType(new byte[MusicValidation.MaxBytes + 1])).Status);
        Assert.Throws<MusicError>(() => MusicValidation.Validate(new("Song", "https://example.com/song.mp3", true, 0, 0, Wave()), true));
        MusicValidation.Validate(new("Renamed", null, false, 0, 1), false);
    }

    [Fact]
    public async Task GatewayEnforcesRolesPersistsTracksAndStreamsRanges()
    {
        var connection = Environment.GetEnvironmentVariable("MUSIC_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection), "Set MUSIC_TEST_CONNECTION to an isolated local test database.");
        var schema = "music_test_" + Guid.NewGuid().ToString("N");
        var cs = new NpgsqlConnectionStringBuilder(connection) { SearchPath = schema }.ConnectionString;
        await using var db = new MusicDatabase(new DbContextOptionsBuilder<MusicDatabase>().UseNpgsql(cs).Options);
        // Identifiers consist solely of the fixed prefix and a generated hexadecimal GUID.
#pragma warning disable EF1002
        await db.Database.ExecuteSqlRawAsync($"CREATE SCHEMA {schema}");
        try
        {
            await db.InitializeAsync();
            await using var app = await Start(cs);
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/music/tracks")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsync("/api/music/tracks", Form())).StatusCode);
            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("User"));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/music/tracks")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsync("/api/music/tracks", Form())).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsync($"/api/music/tracks/{Guid.NewGuid()}", Form())).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.DeleteAsync($"/api/music/tracks/{Guid.NewGuid()}?revision=1")).StatusCode);

            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            var create = await client.PostAsync("/api/music/tracks", Form(file: true));
            Assert.Equal(HttpStatusCode.Created, create.StatusCode);
            var track = (await create.Content.ReadFromJsonAsync<TrackView>())!;
            Assert.StartsWith("/api/music/tracks/", track.AudioUrl);

            // Re-running the additive schema on populated storage must preserve data.
            await db.InitializeAsync();
            Assert.Equal(1, await db.Tracks.CountAsync());
            client.DefaultRequestHeaders.Authorization = null;
            Assert.Single((await client.GetFromJsonAsync<TrackView[]>("/api/music"))!);
            using var range = new HttpRequestMessage(HttpMethod.Get, track.AudioUrl);
            range.Headers.Range = new RangeHeaderValue(0, 11);
            var partial = await client.SendAsync(range);
            Assert.Equal(HttpStatusCode.PartialContent, partial.StatusCode);
            Assert.Equal(Wave()[..12], await partial.Content.ReadAsByteArrayAsync());

            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            var edit = await client.PutAsync($"/api/music/tracks/{track.Id}", Form(title: "Renamed", revision: track.Revision, url: null));
            Assert.Equal(HttpStatusCode.OK, edit.StatusCode);
            var renamed = (await edit.Content.ReadFromJsonAsync<TrackView>())!;
            Assert.Equal(track.AudioUrl, renamed.AudioUrl);
            Assert.Equal("Renamed", renamed.Title);
            Assert.Equal(HttpStatusCode.Conflict, (await client.PutAsync($"/api/music/tracks/{track.Id}", Form(revision: track.Revision))).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await client.DeleteAsync($"/api/music/tracks/{track.Id}?revision={track.Revision}")).StatusCode);

            var replaced = await client.PutAsync($"/api/music/tracks/{track.Id}", Form(revision: renamed.Revision, file: true, enabled: false));
            Assert.Equal(HttpStatusCode.OK, replaced.StatusCode);
            var disabled = (await replaced.Content.ReadFromJsonAsync<TrackView>())!;
            Assert.NotEqual(renamed.AudioUrl, disabled.AudioUrl);
            client.DefaultRequestHeaders.Authorization = null;
            Assert.Empty((await client.GetFromJsonAsync<TrackView[]>("/api/music"))!);
            Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(disabled.AudioUrl)).StatusCode);

            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            Assert.Single((await client.GetFromJsonAsync<TrackView[]>("/api/music/tracks"))!);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(disabled.AudioUrl)).StatusCode);
            Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/music/tracks/{track.Id}?revision={disabled.Revision}")).StatusCode);
            Assert.Equal(0, await db.Tracks.CountAsync());

            var urlTrack = await client.PostAsync("/api/music/tracks", Form());
            Assert.Equal(HttpStatusCode.Created, urlTrack.StatusCode);
            Assert.Equal("https://example.com/song.mp3", (await urlTrack.Content.ReadFromJsonAsync<TrackView>())!.AudioUrl);
        }
        finally { await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA {schema} CASCADE"); }
#pragma warning restore EF1002
    }

    [Fact]
    public async Task UnconfiguredMusicLeavesPublicWebsiteAvailable()
    {
        await using var app = await Start(null);
        using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
        Assert.Empty((await client.GetFromJsonAsync<TrackView[]>("/api/music"))!);
        client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync("/api/music/tracks")).StatusCode);
    }

    private static async Task<WebApplication> Start(string? connection)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing", Args = [] });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?> { ["ConnectionStrings:Music"] = connection });
        builder.Services.AddMusic(builder.Configuration);
        builder.Services.AddScoped<MusicErrorFilter>();
        builder.Services.AddControllers().AddApplicationPart(typeof(MusicController).Assembly);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            options.TokenValidationParameters = new TokenValidationParameters {
                ValidateIssuer = false, ValidateAudience = false, ValidateLifetime = true, ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret))
            });
        builder.Services.AddAuthorization();
        var app = builder.Build();
        app.Urls.Add("http://127.0.0.1:0");
        app.UseAuthentication(); app.UseAuthorization(); app.MapControllers();
        await app.StartAsync();
        return app;
    }

    private static string Token(string role) => new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
        claims: [new Claim(ClaimTypes.Role, role)], expires: DateTime.UtcNow.AddMinutes(5),
        signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)), SecurityAlgorithms.HmacSha256)));

    private static MultipartFormDataContent Form(string title = "Song", int revision = 0, bool file = false, bool enabled = true,
        string? url = "https://example.com/song.mp3")
    {
        var form = new MultipartFormDataContent {
            { new StringContent(title), "title" }, { new StringContent(revision.ToString()), "revision" },
            { new StringContent(enabled.ToString()), "isEnabled" }, { new StringContent("0"), "sortOrder" }
        };
        if (file) form.Add(new ByteArrayContent(Wave()), "file", "test.wav");
        else if (url is not null) form.Add(new StringContent(url), "audioUrl");
        return form;
    }

    private static byte[] Wave()
    {
        var bytes = new byte[48];
        Encoding.ASCII.GetBytes("RIFF").CopyTo(bytes, 0);
        Encoding.ASCII.GetBytes("WAVE").CopyTo(bytes, 8);
        return bytes;
    }
}
