namespace CraftVision.Domain.Entities;

// Immutable cash-movement snapshots; current catalog prices and names never change a past report.
public class OrderFinancialEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public string OrderCode { get; set; } = "";
    public string OrderKind { get; set; } = "Product";
    public string PaymentMethod { get; set; } = "";
    public string Kind { get; set; } = "Receipt";
    public DateTime? OccurredAt { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public decimal MerchandiseAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public Order? Order { get; set; }
    public ICollection<OrderFinancialLine> Lines { get; set; } = new List<OrderFinancialLine>();

    public static OrderFinancialEvent Receipt(Order order, DateTime? occurredAt) => new()
    {
        OrderId = order.Id, UserId = order.UserId, OrderCode = order.OrderCode, OrderKind = order.OrderKind,
        PaymentMethod = order.PaymentMethod.ToString(), OccurredAt = occurredAt,
        MerchandiseAmount = Math.Max(0, order.TotalAmount - (order.ShippingFee - order.ShippingDiscount)),
        ShippingAmount = order.ShippingFee - order.ShippingDiscount,
        Lines = order.OrderKind == "DigitalCard"
            ? [new() { ProductKey = order.CardTemplateSlug ?? "unknown", ProductName = order.CardTemplateSlug ?? "Thiệp số", Quantity = 1, Amount = order.TotalAmount }]
            : DiscountedLines(order),
    };

    private static List<OrderFinancialLine> DiscountedLines(Order order)
    {
        var items = order.OrderItems.OrderBy(i => i.Id).ToList();
        var remainingSubtotal = items.Sum(i => i.SubTotal);
        var remainingDiscount = order.MerchandiseDiscount;
        var result = new List<OrderFinancialLine>();
        foreach (var item in items)
        {
            var discount = remainingSubtotal == 0 ? 0 : Math.Min(item.SubTotal, Math.Min(remainingDiscount,
                Math.Round(remainingDiscount * item.SubTotal / remainingSubtotal, 0, MidpointRounding.AwayFromZero)));
            remainingSubtotal -= item.SubTotal; remainingDiscount -= discount;
            result.Add(new() { ProductKey = item.ProductId.ToString(), ProductName = item.Product?.Name ?? item.ProductId.ToString(),
                Quantity = item.Quantity, Amount = item.SubTotal - discount });
        }
        return result;
    }

    public OrderFinancialEvent Refund(DateTime occurredAt) => new()
    {
        OrderId = OrderId, UserId = UserId, OrderCode = OrderCode, OrderKind = OrderKind,
        PaymentMethod = PaymentMethod, Kind = "Refund", OccurredAt = occurredAt,
        MerchandiseAmount = MerchandiseAmount, ShippingAmount = ShippingAmount,
        Lines = Lines.Select(line => new OrderFinancialLine { ProductKey = line.ProductKey,
            ProductName = line.ProductName, Quantity = line.Quantity, Amount = line.Amount }).ToList(),
    };
}

public class OrderFinancialLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string ProductKey { get; set; } = "";
    public string ProductName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Amount { get; set; }
    public OrderFinancialEvent? Event { get; set; }
}
