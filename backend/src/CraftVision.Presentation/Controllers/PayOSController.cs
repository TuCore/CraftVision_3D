using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/payos")]
public class PayOSController : ControllerBase
{
    private readonly IPayOSService _payOsService;
    private readonly ILogger<PayOSController> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public PayOSController(IPayOSService payOsService, ILogger<PayOSController> logger, IUnitOfWork unitOfWork)
    {
        _payOsService = payOsService;
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Webhook endpoint for PayOS to send payment status updates
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] object webhookBody)
    {
        // PayOS sends the signature in headers, usually "x-payos-signature" or similar
        var signature = Request.Headers["x-payos-signature"].ToString();
        
        try
        {
            var orderCode = await _payOsService.ProcessWebhookAsync(webhookBody, signature);
            if (orderCode.HasValue)
            {
                var order = await _unitOfWork.Orders.GetByOrderCodeAsync(orderCode.Value.ToString());
                if (order != null)
                {
                    order.PaymentStatus = PaymentStatus.Paid;
                    order.OrderStatus = OrderStatus.Processing;
                    _unitOfWork.Orders.Update(order);
                    await _unitOfWork.SaveChangesAsync();
                }

                // Must return 200 OK so PayOS knows we received it
                return Ok(new { success = true });
            }
            
            return BadRequest(new { success = false, message = "Invalid webhook data" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PayOS Webhook");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}
