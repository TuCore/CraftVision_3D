using System;
using CraftVision.Application.DTOs.Gift;

namespace CraftVision.Application.DTOs.Order;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    
    public GiftSummaryDto? Gift { get; set; }
}
