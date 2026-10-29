using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using CraftVision.Gateway;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace CraftVision.CardSharing.Tests;

public sealed class TutorialVideoTests
{
    private const string Secret = "tutorial-tests-signing-key-at-least-32-bytes-long";

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("//example.com/video.mp4")]
    [InlineData("/\\example.com/video.mp4")]
    [InlineData("http://example.com/video.mp4")]
    [InlineData("https://user:password@example.com/video.mp4")]
    [InlineData("https://youtube.com/watch?v=invalid")]
    [InlineData("https://youtube.com/results?search_query=tutorial")]
    public void InvalidVideoUrlsAreRejected(string url) =>
        Assert.Equal(400, Assert.Throws<CardError>(() => TutorialValidation.Validate(new("Tutorial", url, 1))).Status);

    [Theory]
    [InlineData("/videos/payment-tutorial.mp4")]
    [InlineData("https://example.com/tutorial.webm")]
    [InlineData("https://youtu.be/abcdefghijk")]
    [InlineData("https://www.youtube.com/watch?v=abcdefghijk&feature=shared")]
    [InlineData("https://youtube.com/shorts/abcdefghijk")]
    public void SupportedVideoUrlsAreAccepted(string url) => TutorialValidation.Validate(new("Tutorial", url, 1));

    [Fact]
    public async Task GatewayProtectsWritesAndSharedConfigurationSurvivesRestartAndRemoval()
    {
        var connection = Environment.GetEnvironmentVariable("CARDS_TEST_CONNECTION");
        Assert.False(string.IsNullOrWhiteSpace(connection), "Set CARDS_TEST_CONNECTION to an isolated local PostgreSQL database.");
        var schema = "tutorial_test_" + Guid.NewGuid().ToString("N");
        var cs = new NpgsqlConnectionStringBuilder(connection) { SearchPath = schema }.ConnectionString;
        await using var db = new CardDatabase(new DbContextOptionsBuilder<CardDatabase>().UseNpgsql(cs).Options);
        // The generated schema identifier contains only a fixed prefix and hexadecimal GUID.
#pragma warning disable EF1002
        await db.Database.ExecuteSqlRawAsync($"CREATE SCHEMA {schema}");
        try
        {
            // Apply the upgrade to a populated legacy schema rather than an empty database.
            using var stream = typeof(CardDatabase).Assembly.GetManifestResourceStream("CardSharing.schema.sql")!;
            using var reader = new StreamReader(stream);
            await db.Database.ExecuteSqlRawAsync(await reader.ReadToEndAsync());
            var cardId = Guid.NewGuid();
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO \"Cards\" (\"Id\", \"OwnerId\", \"DraftJson\", \"Revision\", \"UpdatedAt\") VALUES ({cardId}, {Guid.NewGuid()}, {"{}"}, 1, {DateTime.UtcNow})");
            await db.InitializeAsync();
            Assert.Equal(cardId, (await db.Cards.SingleAsync()).Id);

            await using var app = await Start(cs);
            using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
            var initial = (await client.GetFromJsonAsync<TutorialConfiguration>("/api/tutorial-video"))!;
            Assert.Equal("/videos/payment-tutorial.mp4", initial.Video!.VideoUrl);
            Assert.Contains("no-store", (await client.GetAsync("/api/tutorial-video")).Headers.CacheControl!.ToString());
            var input = new TutorialInput("Shared tutorial", "https://example.com/shared.mp4", initial.Revision);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/tutorial-video", input)).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.DeleteAsync("/api/tutorial-video?revision=1")).StatusCode);
            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("User"));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync("/api/tutorial-video", input)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await client.DeleteAsync("/api/tutorial-video?revision=1")).StatusCode);
            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync("/api/tutorial-video", input with { VideoUrl = "javascript:alert(1)" })).StatusCode);
            var saved = await client.PutAsJsonAsync("/api/tutorial-video", input);
            Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
            var current = (await saved.Content.ReadFromJsonAsync<TutorialConfiguration>())!;
            Assert.Equal(initial.Revision + 1, current.Revision);
            Assert.Equal(HttpStatusCode.Conflict, (await client.PutAsJsonAsync("/api/tutorial-video", input)).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await client.DeleteAsync($"/api/tutorial-video?revision={initial.Revision}")).StatusCode);
            await db.InitializeAsync();
            Assert.Equal(input.VideoUrl, (await new TutorialVideoService(db).Get(default)).Video!.VideoUrl);
            Assert.Equal(1, await db.TutorialSettings.CountAsync());

            var deleted = await client.DeleteAsync($"/api/tutorial-video?revision={current.Revision}");
            Assert.Equal(HttpStatusCode.OK, deleted.StatusCode);
            var empty = (await deleted.Content.ReadFromJsonAsync<TutorialConfiguration>())!;
            Assert.Null(empty.Video);
            await db.InitializeAsync();
            Assert.Null((await new TutorialVideoService(db).Get(default)).Video);
            client.DefaultRequestHeaders.Authorization = null;
            Assert.Null((await client.GetFromJsonAsync<TutorialConfiguration>("/api/tutorial-video"))!.Video);

            client.DefaultRequestHeaders.Authorization = new("Bearer", Token("Admin"));
            var recreated = await client.PutAsJsonAsync("/api/tutorial-video", input with { Revision = empty.Revision, VideoUrl = "https://youtu.be/abcdefghijk" });
            Assert.Equal(HttpStatusCode.OK, recreated.StatusCode);
            Assert.Equal(1, await db.TutorialSettings.CountAsync());
            Assert.Equal(cardId, (await db.Cards.SingleAsync()).Id);
        }
        finally { await db.Database.ExecuteSqlRawAsync($"DROP SCHEMA {schema} CASCADE"); }
#pragma warning restore EF1002
    }

    private static async Task<WebApplication> Start(string connection)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing", Args = [] });
        builder.Services.AddDbContext<CardDatabase>(options => options.UseNpgsql(connection));
        builder.Services.AddScoped<TutorialVideoService>();
        builder.Services.AddScoped<CardErrorFilter>();
        builder.Services.AddControllers().AddApplicationPart(typeof(TutorialVideoController).Assembly);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false, ValidateAudience = false, ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)),
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
}
