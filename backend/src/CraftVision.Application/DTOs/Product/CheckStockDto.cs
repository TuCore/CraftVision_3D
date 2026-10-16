using System;
using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Product;

public class CheckStockRequestDto
{
    public List<CheckStockItemDto> Items { get; set; } = new();
}

public class CheckStockItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class ProductStockStatusDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string ProductType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsOutOfStock { get; set; }
    public bool IsSufficient { get; set; }
    public int RequestedQuantity { get; set; }
    public string? Message { get; set; }
}
