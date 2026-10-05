using Microsoft.Extensions.Configuration;
using PayOS;
using PayOS.Models.V2.PaymentRequests;

namespace CraftVision.BuildingBlocks.Payments;

public sealed record PaymentLink(string Id, string CheckoutUrl);
public sealed record PaymentReceipt(string Id, long OrderCode, long Amount, long AmountPaid, string Status);
public interface IPaymentProvider
{
    Task<PaymentLink> Create(long orderCode, int amount, string returnUrl, string cancelUrl, CancellationToken ct);
    Task<PaymentReceipt> Get(long orderCode, CancellationToken ct);
}

public sealed class PayOsPaymentProvider(IConfiguration config) : IPaymentProvider
{
    private PayOSClient Client()
    {
        string Setting(string key) => new[] { config[$"PayOS:{key}"], config[$"PayOS__{key}"], config[$"PayOS_{key}"] }
            .FirstOrDefault(v => !string.IsNullOrWhiteSpace(v) && !v.StartsWith("REPLACE_"))?.Trim()
            ?? throw new InvalidOperationException("PayOS is not configured.");
        return new PayOSClient(Setting("ClientId"), Setting("ApiKey"), Setting("ChecksumKey"));
    }
    public async Task<PaymentLink> Create(long orderCode, int amount, string returnUrl, string cancelUrl, CancellationToken ct)
    {
        var link = await Client().PaymentRequests.CreateAsync(new CreatePaymentLinkRequest
        {
            OrderCode = orderCode, Amount = amount, Description = "Thanh toan thiep 3D",
            ReturnUrl = returnUrl, CancelUrl = cancelUrl
        }).WaitAsync(ct);
        return new PaymentLink(link.PaymentLinkId, link.CheckoutUrl);
    }
    public async Task<PaymentReceipt> Get(long orderCode, CancellationToken ct)
    {
        var receipt = await Client().PaymentRequests.GetAsync(orderCode).WaitAsync(ct);
        return new PaymentReceipt(receipt.Id, receipt.OrderCode, receipt.Amount, receipt.AmountPaid, receipt.Status.ToString().ToUpperInvariant());
    }
}
