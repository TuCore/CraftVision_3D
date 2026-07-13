using System;
using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Gift;

public class GiftPageDto
{
    public string? GiftTitle { get; set; }
    public string? SenderName { get; set; }
    public string? ReceiverName { get; set; }
    public string? Message { get; set; }
    public string? Theme { get; set; }
    
    public string? ThreeDModelUrl { get; set; }
    public string? PreviewImageUrl { get; set; }
    public string? ThreeDModelType { get; set; }
    
    public int ScanCount { get; set; }
    
    public List<GiftMediaDto> MediaList { get; set; } = new();
}
