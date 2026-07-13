using System;

namespace CraftVision.Domain.Entities;

public class ScanHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GiftId { get; set; }
    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Device { get; set; }
    public string? Location { get; set; }

    public Gift? Gift { get; set; }
}
