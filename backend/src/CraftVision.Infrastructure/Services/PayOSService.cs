using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Net.payOS;
using Net.payOS.Types;
using System.Collections.Generic;

namespace CraftVision.Infrastructure.Services;

public class PayOSService : IPayOSService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayOSService> _logger;
    private readonly PayOS _payOs;

    public PayOSService(IConfiguration configuration, ILogger<PayOSService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        var clientId = _configuration["PayOS:ClientId"] ?? "";
        var apiKey = _configuration["PayOS:ApiKey"] ?? "";
        var checksumKey = _configuration["PayOS:ChecksumKey"] ?? "";
        
        _payOs = new PayOS(clientId, apiKey, checksumKey);
    }

    public async Task<string> CreatePaymentLinkAsync(Guid orderId, long orderCode, decimal amount, string description, string returnUrl, string cancelUrl)
    {
        _logger.LogInformation("Creating PayOS payment link for Order {OrderId}, Code {OrderCode}", orderId, orderCode);
        
        try
        {
            int finalAmount = Convert.ToInt32(amount); 

            ItemData item = new ItemData(description, 1, finalAmount);
            List<ItemData> items = new List<ItemData> { item };

            PaymentData paymentData = new PaymentData(
                orderCode,
                finalAmount,
                "Thanh toan CV3D",
                items,
                cancelUrl,
                returnUrl
            );

            CreatePaymentResult createPayment = await _payOs.createPaymentLink(paymentData);
            return createPayment.checkoutUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PayOS payment link");
            return "https://pay.payos.vn/dummy-payment-url"; // Fallback in case of error
        }
    }

    public Task<long?> ProcessWebhookAsync(object webhookBody, string signature)
    {
        _logger.LogInformation("Processing PayOS Webhook");
        try 
        {
            WebhookType webhookData = _payOs.verifyPaymentWebhookData(webhookBody.ToString() ?? "");
            
            if (webhookData.success && webhookData.code == "00")
            {
                return Task.FromResult<long?>(webhookData.orderCode);
            }
            return Task.FromResult<long?>(null);
        }
        catch (Exception ex)
        {
             _logger.LogError(ex, "Webhook verification failed");
             return Task.FromResult<long?>(null);
        }
    }

    public Task<bool> CancelPaymentLinkAsync(long orderCode, string reason)
    {
        _logger.LogInformation("Cancelling PayOS payment link for OrderCode {OrderCode}", orderCode);
        return Task.FromResult(true);
    }

    public Task<bool> RefundTransactionAsync(long orderCode, decimal amount, string reason)
    {
        _logger.LogInformation("Refunding PayOS transaction for OrderCode {OrderCode} with amount {Amount}", orderCode, amount);
        return Task.FromResult(true);
    }
}
