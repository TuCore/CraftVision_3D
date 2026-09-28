using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace CraftVision.Presentation.Hubs;

public class PaymentHub : Hub
{
    // Clients will join a group named after their OrderId or UserId
    // to receive targeted payment status updates.
    
    public async Task SubscribeToOrder(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
    }
    
    public async Task UnsubscribeFromOrder(string orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Order_{orderId}");
    }
}
