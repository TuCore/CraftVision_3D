using System;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces.Services;

public interface IPayOSService
{
    /// <summary>
    /// Creates a payment link/QR code for a specific order
    /// </summary>
    Task<(string CheckoutUrl, string QrCode, string Bin, string AccountNumber, string AccountName, int Amount, string Description)> CreatePaymentLinkAsync(Guid orderId, long orderCode, decimal amount, string description, string returnUrl, string cancelUrl);
    
    /// <summary>
    /// Validates and processes the webhook data received from PayOS, returning the OrderCode if successful.
    /// </summary>
    Task<long?> ProcessWebhookAsync(object webhookBody, string signature);
    
    /// <summary>
    /// Cancels a pending payment link
    /// </summary>
    Task<bool> CancelPaymentLinkAsync(long orderCode, string reason);
    
    /// <summary>
    /// Checks the payment status directly from PayOS
    /// </summary>
    Task<bool> CheckPaymentStatusAsync(long orderCode);

    /// <summary>
    /// Refunds an already paid transaction (if supported or manual logging)
    /// </summary>
    Task<bool> RefundTransactionAsync(long orderCode, decimal amount, string reason);
}
