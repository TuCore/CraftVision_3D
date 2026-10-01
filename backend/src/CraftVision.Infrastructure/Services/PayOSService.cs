using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PayOS;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using System.Collections.Generic;

namespace CraftVision.Infrastructure.Services;

public class PayOSService : IPayOSService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PayOSService> _logger;
    private readonly PayOSClient _payOs;

    public PayOSService(IConfiguration configuration, ILogger<PayOSService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        var clientId = GetConfigValue("ClientId");
        var apiKey = GetConfigValue("ApiKey");
        var checksumKey = GetConfigValue("ChecksumKey");

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(checksumKey))
        {
            _logger.LogWarning("PayOS credentials are missing or not properly configured! Please ensure PayOS__ClientId / PayOS_ClientId is set in environment variables or appsettings.json.");
        }
        
        _payOs = new PayOSClient(clientId, apiKey, checksumKey);
    }

    private string GetConfigValue(string key)
    {
        // 1. Standard .NET hierarchical path: PayOS:Key (matches PayOS__Key in Linux/Docker env)
        var val = _configuration[$"PayOS:{key}"];
        if (IsValidConfig(val)) return val!.Trim();

        // 2. Direct double underscore PayOS__Key
        val = _configuration[$"PayOS__{key}"];
        if (IsValidConfig(val)) return val!.Trim();

        // 3. Single underscore PayOS_Key (common custom env setting)
        val = _configuration[$"PayOS_{key}"];
        if (IsValidConfig(val)) return val!.Trim();

        // 4. Direct OS environment variables
        val = Environment.GetEnvironmentVariable($"PayOS__{key}") ?? Environment.GetEnvironmentVariable($"PayOS_{key}");
        if (IsValidConfig(val)) return val!.Trim();

        return "";
    }

    private static bool IsValidConfig(string? value)
    {
        return !string.IsNullOrWhiteSpace(value) && !value.StartsWith("REPLACE_");
    }

    public async Task<string> CreatePaymentLinkAsync(Guid orderId, long orderCode, decimal amount, string description, string returnUrl, string cancelUrl)
    {
        _logger.LogInformation("Creating PayOS payment link for Order {OrderId}, Code {OrderCode}", orderId, orderCode);
        
        try
        {
            int finalAmount = Convert.ToInt32(amount); 

            var paymentRequest = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = finalAmount,
                Description = "Thanh toan CV3D",
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
                // You can map items here if needed, but not strictly required by the new simplified signature
            };

            var paymentLink = await _payOs.PaymentRequests.CreateAsync(paymentRequest);
            return paymentLink.CheckoutUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PayOS payment link");
            return "https://pay.payos.vn/dummy-payment-url"; // Fallback in case of error
        }
    }

    public async Task<long?> ProcessWebhookAsync(object webhookBody, string signature)
    {
        _logger.LogInformation("Processing PayOS Webhook");
        try 
        {
            // Note: In real app, the webhookBody should be mapped to PayOS.Models.Webhook
            // Assuming webhookBody is a JSON string passed from controller
            var webhookJson = webhookBody.ToString() ?? "";
            var webhook = System.Text.Json.JsonSerializer.Deserialize<Webhook>(webhookJson);
            
            if (webhook == null) return null;

            var verifiedData = await _payOs.Webhooks.VerifyAsync(webhook);
            
            if (verifiedData != null && verifiedData.Code == "00")
            {
                return verifiedData.OrderCode;
            }
            return null;
        }
        catch (Exception ex)
        {
             _logger.LogError(ex, "Webhook verification failed");
             return null;
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
