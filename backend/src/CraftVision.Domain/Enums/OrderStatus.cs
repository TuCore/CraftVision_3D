namespace CraftVision.Domain.Enums;

public enum OrderStatus
{
    Pending,
    Processing,
    WaitingProduction,
    Producing,
    ReadyToShip,
    Shipped,
    Delivered,
    Cancelled
}
