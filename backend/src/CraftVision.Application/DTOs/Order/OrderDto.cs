using System;
using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Order;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public string? ReceiverName { get; set; }
    public string? ReceiverPhone { get; set; }
    public string? ReceiverAddress { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CheckoutUrl { get; set; }
    
    public List<OrderItemDto> Items { get; set; } = new();
}
