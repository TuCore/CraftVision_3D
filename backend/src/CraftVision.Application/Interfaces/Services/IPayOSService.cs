using System;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces.Services;

public interface IPayOSService
{
    /// <summary>
    /// Creates a payment link/QR code for a specific order
    /// </summary>
    Task<string> CreatePaymentLinkAsync(Guid orderId, decimal amount, string description, string returnUrl, string cancelUrl);
    
    /// <summary>
    /// Validates and processes the webhook data received from PayOS
    /// </summary>
    Task<bool> ProcessWebhookAsync(object webhookBody, string signature);
    
    /// <summary>
    /// Cancels a pending payment link
    /// </summary>
    Task<bool> CancelPaymentLinkAsync(long orderCode, string reason);
    
    /// <summary>
    /// Refunds an already paid transaction (if supported or manual logging)
    /// </summary>
    Task<bool> RefundTransactionAsync(long orderCode, decimal amount, string reason);
}
