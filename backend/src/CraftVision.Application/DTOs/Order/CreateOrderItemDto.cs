using System;
using CraftVision.Application.DTOs.Gift;

namespace CraftVision.Application.DTOs.Order;

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public bool WantNfc { get; set; }
    public decimal? ExtraPrice { get; set; }
    public string? CardType { get; set; }
    public string? CardSlug { get; set; }
    
    public CreateGiftDto? Gift { get; set; }
}
