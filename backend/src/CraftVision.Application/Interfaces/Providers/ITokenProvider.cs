using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Providers;

public interface ITokenProvider
{
    string GenerateJwtToken(User user);
}
