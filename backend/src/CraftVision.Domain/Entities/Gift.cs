using System;
using System.Collections.Generic;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class Gift
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderItemId { get; set; }
    public Guid NfcTagId { get; set; }
    
    public string? GiftTitle { get; set; }
    public string? SenderName { get; set; }
    public string? ReceiverName { get; set; }
    public string? Message { get; set; }
    public string? Theme { get; set; }
    public MessageSource MessageSource { get; set; } = MessageSource.Manual;
    
    public string? ThreeDModelUrl { get; set; }
    public string? ThreeDPrompt { get; set; }
    public string? PreviewImageUrl { get; set; }
    public ModelType? ThreeDModelType { get; set; } 
    
    public GiftStatus Status { get; set; } = GiftStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public OrderItem? OrderItem { get; set; }
    public NfcTag? NfcTag { get; set; }
    public GiftAiProfile? AiProfile { get; set; }
    public ICollection<GiftMedia> MediaList { get; set; } = new List<GiftMedia>();
    public ICollection<ScanHistory> ScanHistories { get; set; } = new List<ScanHistory>();
}
