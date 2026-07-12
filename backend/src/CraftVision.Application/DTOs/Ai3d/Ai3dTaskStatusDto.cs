using System;

namespace CraftVision.Application.DTOs.Ai3d;

public class Ai3dTaskStatusDto
{
    public Guid TaskId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ModelUrl { get; set; }
    public string? PreviewImageUrl { get; set; }
    public int Progress { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
}
