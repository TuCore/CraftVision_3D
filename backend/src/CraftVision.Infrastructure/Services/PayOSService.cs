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
            throw new Exception("PayOS credentials are missing or not properly configured! Please ensure PayOS__ClientId, PayOS__ApiKey, and PayOS__ChecksumKey are set.");
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

    public async Task<(string CheckoutUrl, string QrCode, string Bin, string AccountNumber, string AccountName, int Amount, string Description)> CreatePaymentLinkAsync(Guid orderId, long orderCode, decimal amount, string description, string returnUrl, string cancelUrl)
    {
        _logger.LogInformation("Creating PayOS payment link for Order {OrderId}, Code {OrderCode}", orderId, orderCode);
        
        try
        {
            int finalAmount = Convert.ToInt32(amount); 
            if (finalAmount < 2000) 
            {
                // PayOS usually requires a minimum of 2000 VND
                // If amount is less than 2000, we should bypass PayOS or throw an explicit error.
                throw new Exception("Số tiền thanh toán qua PayOS phải lớn hơn hoặc bằng 2000 VNĐ.");
            }

            var paymentRequest = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = finalAmount,
                Description = $"CV3D {orderCode}", // Keep description short and alphanumeric
                ReturnUrl = returnUrl,
                CancelUrl = cancelUrl
            };

            var paymentLink = await _payOs.PaymentRequests.CreateAsync(paymentRequest);
            return (paymentLink.CheckoutUrl, paymentLink.QrCode, paymentLink.Bin, paymentLink.AccountNumber, paymentLink.AccountName, (int)paymentLink.Amount, paymentLink.Description);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PayOS payment link");
            throw new Exception($"Lỗi kết nối PayOS: {ex.Message}");
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

    public async Task<bool> CheckPaymentStatusAsync(long orderCode)
    {
        try
        {
            var paymentLinkInfo = await _payOs.PaymentRequests.GetAsync(orderCode);
            if (paymentLinkInfo != null && paymentLinkInfo.Status.ToString().ToUpper().Trim() == "PAID")
            {
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check payment status for OrderCode {OrderCode}", orderCode);
            return false;
        }
    }

    public Task<bool> RefundTransactionAsync(long orderCode, decimal amount, string reason)
    {
        _logger.LogInformation("Refunding PayOS transaction for OrderCode {OrderCode} with amount {Amount}", orderCode, amount);
        return Task.FromResult(true);
    }
}
