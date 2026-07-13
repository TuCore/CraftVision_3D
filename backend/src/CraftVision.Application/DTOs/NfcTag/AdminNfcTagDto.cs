namespace CraftVision.Application.DTOs.NfcTag;

public class AdminNfcTagDto
{
    public Guid Id { get; set; }
    public string TagCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? LinkedUrl { get; set; }
    public int ScanCount { get; set; }
    public DateTime? LastScanAt { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public AdminNfcGiftDto? Gift { get; set; }
}

public class AdminNfcGiftDto
{
    public Guid Id { get; set; }
    public AdminNfcOrderItemDto? OrderItem { get; set; }
}

public class AdminNfcOrderItemDto
{
    public AdminNfcOrderDto? Order { get; set; }
}

public class AdminNfcOrderDto
{
    public string OrderCode { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
}
