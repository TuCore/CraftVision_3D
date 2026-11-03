namespace CraftVision.Domain.Entities;

public class VoucherUsage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VoucherId { get; set; }
    public Guid UserId { get; set; }
    public Guid OrderId { get; set; }
    public string Status { get; set; } = "Reserved";
    public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public int Revision { get; set; } = 1;
    public Voucher? Voucher { get; set; }
    public Order? Order { get; set; }
    public User? User { get; set; }
}
