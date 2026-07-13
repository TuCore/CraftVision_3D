using System;

namespace CraftVision.Application.DTOs.Product;

public class ProductFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public string? Keyword { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Type { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
}
