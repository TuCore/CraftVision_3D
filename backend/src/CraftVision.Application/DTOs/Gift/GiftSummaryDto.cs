using System;

namespace CraftVision.Application.DTOs.Gift;

public class GiftSummaryDto
{
    public Guid Id { get; set; }
    public string? GiftTitle { get; set; }
    public string? SenderName { get; set; }
    public string? ReceiverName { get; set; }
    public string? NfcTagCode { get; set; }
    public string Status { get; set; } = string.Empty;
}
