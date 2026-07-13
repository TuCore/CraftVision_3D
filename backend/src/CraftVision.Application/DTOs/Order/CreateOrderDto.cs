using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Order;

public class CreateOrderDto
{
    public string? ReceiverName { get; set; }
    public string? ReceiverPhone { get; set; }
    public string? ReceiverAddress { get; set; }
    
    public List<CreateOrderItemDto> Items { get; set; } = new();
}
