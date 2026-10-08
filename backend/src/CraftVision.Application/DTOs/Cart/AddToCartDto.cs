using System;

namespace CraftVision.Application.DTOs.Cart;

public class AddToCartDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string SelectedOptions { get; set; } = string.Empty;
}
