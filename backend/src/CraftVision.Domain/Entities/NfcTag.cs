using System;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class NfcTag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TagCode { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public NfcStatus Status { get; set; } = NfcStatus.Available;
    
    public DateTime? ActivatedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Gift? Gift { get; set; }
}
