using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Common;

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => PageSize > 0 ? (TotalItems + PageSize - 1) / PageSize : 0;
}
