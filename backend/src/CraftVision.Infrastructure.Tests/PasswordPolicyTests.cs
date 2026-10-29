using System.Text.Json;
using CraftVision.Application.DTOs.Auth;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Services;
using CraftVision.Domain.Entities;
using CraftVision.Presentation.Controllers;
using CraftVision.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CraftVision.Infrastructure.Tests;

public class PasswordPolicyTests
{
    public static IEnumerable<object[]> PolicyCases()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "password-policy-cases.json")));
        return document.RootElement.EnumerateArray()
            .Select(item => new object[] { item.GetProperty("password").GetString()!, item.GetProperty("valid").GetBoolean() }).ToArray();
    }

    [Theory]
    [MemberData(nameof(PolicyCases))]
    public void MatchesSharedFrontendPolicyCases(string password, bool expected) => Assert.Equal(expected, PasswordPolicy.IsValid(password));

    [Theory]
    [InlineData(null)]
    [InlineData("Short1!")]
    [InlineData("lowercase1!")]
    [InlineData("UPPERCASE1!")]
    [InlineData("NoNumbers!")]
    [InlineData("NoSpecial1")]
    [InlineData("Spaces123 ")]
    public async Task RegistrationApiRejectsWeakPasswordsBeforeDatabaseOrHasherCalls(string? password)
    {
        var users = new Mock<IUserRepository>(MockBehavior.Strict);
        var unit = new Mock<IUnitOfWork>(MockBehavior.Strict);
        var hasher = new Mock<IPasswordHasher>(MockBehavior.Strict);
        var tokens = new Mock<ITokenProvider>(MockBehavior.Strict);
        var email = new Mock<IEmailService>(MockBehavior.Strict);
        var service = new AuthService(users.Object, unit.Object, hasher.Object, tokens.Object, new ConfigurationBuilder().Build(), email.Object);

        var result = await new AuthController(service).Register(new RegisterRequest
        {
            FullName = "Policy test", Email = "policy@example.test", Password = password!
        });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
        Assert.Contains(PasswordPolicy.ValidationMessage, JsonSerializer.Serialize(badRequest.Value, new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }));
        users.VerifyNoOtherCalls(); unit.VerifyNoOtherCalls(); hasher.VerifyNoOtherCalls(); tokens.VerifyNoOtherCalls(); email.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task RegistrationAcceptsStrongPasswordAndHashesItBeforeSaving()
    {
        const string password = "Abc1234!";
        var users = new Mock<IUserRepository>();
        users.Setup(repository => repository.ExistsByEmailAsync("policy@example.test")).ReturnsAsync(false);
        var unit = new Mock<IUnitOfWork>();
        unit.Setup(work => work.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(provider => provider.HashPassword(password)).Returns("hashed-test-password");
        var tokens = new Mock<ITokenProvider>();
        tokens.Setup(provider => provider.GenerateJwtToken(It.IsAny<User>())).Returns("test-token");
        var email = new Mock<IEmailService>();
        email.Setup(service => service.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);
        var service = new AuthService(users.Object, unit.Object, hasher.Object, tokens.Object, new ConfigurationBuilder().Build(), email.Object);

        var response = await service.RegisterAsync(new RegisterRequest { Email = "policy@example.test", FullName = "Policy test", Password = password });

        Assert.Equal("test-token", response.Token);
        users.Verify(repository => repository.Add(It.Is<User>(user => user.PasswordHash == "hashed-test-password")), Times.Once);
        hasher.Verify(provider => provider.HashPassword(password), Times.Once);
        unit.Verify(work => work.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
