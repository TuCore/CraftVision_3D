using System;

namespace CraftVision.Application.DTOs.NfcTag;

public class NfcTagDto
{
    public Guid Id { get; set; }
    public string TagCode { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ActivatedAt { get; set; }
}
