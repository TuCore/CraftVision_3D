using System;

namespace CraftVision.Application.DTOs.Ai3d;

public class Ai3dTaskStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = null!;
    public string? TripoTaskId { get; set; }
    public string? ResultModelUrl { get; set; }
    public int? Progress { get; set; }
    public string? ErrorMessage { get; set; }
}
