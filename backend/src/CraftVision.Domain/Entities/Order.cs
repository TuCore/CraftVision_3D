using System;
using System.Collections.Generic;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    
    public string OrderCode { get; set; } = string.Empty;
    
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cod;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;
    
    public string? ReceiverName { get; set; }
    public string? ReceiverPhone { get; set; }
    public string? ReceiverAddress { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
