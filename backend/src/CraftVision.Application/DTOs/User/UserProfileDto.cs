namespace CraftVision.Application.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string Tier { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
