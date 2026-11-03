using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Common;
using CraftVision.Application.DTOs.Order;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.DTOs.Gift;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;
using Microsoft.Extensions.Configuration;

using CraftVision.Application.Interfaces.Services;

namespace CraftVision.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IPayOSService _payOsService;
    private readonly IOrderPricingService? _pricing;
    private readonly IWebVoucherService? _vouchers;

    public OrderService(IUnitOfWork unitOfWork, IConfiguration configuration, IPayOSService payOsService,
        IOrderPricingService? pricing = null, IWebVoucherService? vouchers = null)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _payOsService = payOsService;
        _pricing = pricing;
        _vouchers = vouchers;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.VoucherCode) && dto.PricingVersion != 1)
            throw new ArgumentException("Vui lòng cập nhật báo giá trước khi dùng mã giảm giá.");
        var committed = false;
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                throw new Exception("Order must have at least one item.");
            }

            var priced = dto.PricingVersion == 1
                ? await (_pricing ?? throw new InvalidOperationException("Pricing service unavailable.")).PriceAsync(dto) : null;
            if (priced is not null)
                for (var index = 0; index < dto.Items.Count; index++) dto.Items[index].ProductId = priced.Lines[index].ProductId;

            var order = new Order
            {
                UserId = userId,
                OrderCode = GenerateOrderCode(),
                PaymentMethod = Enum.TryParse<PaymentMethod>(dto.PaymentMethod, true, out var pm) ? pm : PaymentMethod.Cod,
                PaymentStatus = PaymentStatus.Unpaid,
                ReceiverName = dto.ReceiverName,
                ReceiverPhone = dto.ReceiverPhone,
                ReceiverAddress = dto.ReceiverAddress,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _unitOfWork.Orders.Add(order);
            decimal totalAmount = 0;
            ProductType? commonProductType = null;

            foreach (var itemDto in dto.Items)
            {
                if (itemDto.Quantity <= 0 || itemDto.ExtraPrice < 0) throw new ArgumentException("Số lượng hoặc phụ phí không hợp lệ.");
                if (itemDto.ProductId == Guid.Empty)
                {
                    // Fallback for digital templates from frontend
                    var filter = new CraftVision.Application.DTOs.Product.ProductFilterDto { Keyword = "Thiệp 3D", PageSize = 1, Page = 1 };
                    var (items, _) = await _unitOfWork.Products.SearchAndFilterAsync(filter);
                    var templateProduct = items.FirstOrDefault();
                    
                    if (templateProduct == null)
                    {
                        throw new Exception("Lỗi: Không tìm thấy sản phẩm 'Thiệp 3D' trong hệ thống. Vui lòng tạo một sản phẩm có tên 'Thiệp 3D' trong phần quản trị (Admin) để bán các mẫu thiệp điện tử.");
                    }
                    itemDto.ProductId = templateProduct.Id;
                }

                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                {
                    throw new Exception($"Product with id {itemDto.ProductId} not found.");
                }
                else if (!product.IsActive)
                {
                    throw new Exception($"Product with id {itemDto.ProductId} is inactive.");
                }

                if (commonProductType == null)
                {
                    commonProductType = product.ProductType;
                }
                else if (commonProductType != product.ProductType)
                {
                    throw new Exception("Không thể đặt sản phẩm có sẵn và PreOrder trong cùng một đơn hàng.");
                }

                if (product.ProductType == ProductType.InStock)
                {
                    if (product.Stock <= 0)
                        throw new Exception($"Sản phẩm '{product.Name}' đã hết hàng.");
                    if (product.Stock < itemDto.Quantity)
                        throw new Exception($"Sản phẩm '{product.Name}' không đủ số lượng trong kho (chỉ còn {product.Stock} sản phẩm).");

                    order.OrderStatus = OrderStatus.Pending;
                }
                else
                {
                    order.OrderStatus = OrderStatus.WaitingProduction;
                }

                // We allow adding NFC cards to any product even if SupportsNfc is false.
                // The physical NFC card can just be shipped alongside the product.

                decimal extraFee = itemDto.ExtraPrice ?? (itemDto.WantNfc ? 5000m : 0m);
                decimal unitPrice = priced is null ? product.Price + extraFee : priced.Lines[dto.Items.IndexOf(itemDto)].UnitPrice;

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = unitPrice,
                    SubTotal = unitPrice * itemDto.Quantity,
                    CreatedAt = DateTime.UtcNow
                };
                
                totalAmount += orderItem.SubTotal;
                _unitOfWork.OrderItems.Add(orderItem);

                if (itemDto.WantNfc)
                {
                    if (itemDto.Gift == null)
                        throw new Exception("Gift details must be provided when WantNfc is true.");

                    if (itemDto.Gift.MessageSource == "Manual" && string.IsNullOrWhiteSpace(itemDto.Gift.Message))
                    {
                        itemDto.Gift.Message = "Không có lời chúc";
                    }

                    var availableTag = await _unitOfWork.NfcTags.GetFirstAvailableAsync();
                    var newTag = availableTag is null;
                    if (availableTag == null)
                    {
                        // Auto-create a new tag if none are available
                        availableTag = new NfcTag
                        {
                            TagCode = $"NFC{DateTime.UtcNow.Ticks.ToString().Substring(6)}",
                            SecretKey = Guid.NewGuid().ToString("N"),
                            Status = NfcStatus.Available,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _unitOfWork.NfcTags.Add(availableTag);
                        // We must save changes to generate the Id if it's not a sequential GUID,
                        // but since Id is a UUID it might be auto-generated by EF on Add.
                    }

                    availableTag.Status = NfcStatus.Reserved;
                    var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                    availableTag.LinkedUrl = $"{frontendUrl.TrimEnd('/')}/gift/scan/{availableTag.SecretKey}";
                    availableTag.UpdatedAt = DateTime.UtcNow;
                    if (!newTag) _unitOfWork.NfcTags.Update(availableTag);

                    var gift = new Gift
                    {
                        OrderItemId = orderItem.Id,
                        NfcTagId = availableTag.Id,
                        GiftTitle = itemDto.Gift.GiftTitle,
                        SenderName = itemDto.Gift.SenderName,
                        ReceiverName = itemDto.Gift.ReceiverName,
                        Message = itemDto.Gift.Message,
                        Theme = itemDto.Gift.Theme,
                        MessageSource = Enum.TryParse<MessageSource>(itemDto.Gift.MessageSource, out var src) ? src : MessageSource.Manual,
                        ThreeDModelUrl = itemDto.Gift.ThreeDModelUrl,
                        ThreeDPrompt = itemDto.Gift.ThreeDPrompt,
                        PreviewImageUrl = itemDto.Gift.PreviewImageUrl,
                        ThreeDModelType = Enum.TryParse<ModelType>(itemDto.Gift.ThreeDModelType, out var type) ? type : null,
                        CreatedAt = DateTime.UtcNow
                    };
                    
                    _unitOfWork.Gifts.Add(gift);

                    if (itemDto.Gift.AiProfile != null)
                    {
                        var profile = new GiftAiProfile
                        {
                            GiftId = gift.Id,
                            GiftCategoryId = itemDto.Gift.AiProfile.GiftCategoryId,
                            Relationship = itemDto.Gift.AiProfile.Relationship,
                            WritingStyle = itemDto.Gift.AiProfile.WritingStyle,
                            MessageLength = itemDto.Gift.AiProfile.MessageLength,
                            EmojiLevel = itemDto.Gift.AiProfile.EmojiLevel,
                            Language = itemDto.Gift.AiProfile.Language,
                            AdditionalContext = itemDto.Gift.AiProfile.AdditionalContext,
                            DesignPrompt = itemDto.Gift.AiProfile.DesignPrompt,
                            CreatedAt = DateTime.UtcNow
                        };
                        _unitOfWork.GiftAiProfiles.Add(profile);
                    }
                    
                    if (itemDto.Gift.MediaFileIds != null && itemDto.Gift.MediaFileIds.Any())
                    {
                        int orderIndex = 1;
                        foreach (var fileId in itemDto.Gift.MediaFileIds)
                        {
                            _unitOfWork.GiftMediaList.AddRange(new List<GiftMedia> 
                            { 
                                new GiftMedia { GiftId = gift.Id, FileId = fileId, DisplayOrder = orderIndex++, MediaType = MediaType.Image, CreatedAt = DateTime.UtcNow } 
                            });
                        }
                    }
                }
                else if (itemDto.Gift != null)
                {
                    throw new Exception("Gift details should not be provided when WantNfc is false.");
                }
            }

            decimal shippingFee = priced?.ShippingFee ?? dto.ShippingFee ?? CalculateShippingFee(dto.ReceiverAddress, totalAmount);
            if (shippingFee < 0) throw new ArgumentException("Phí vận chuyển không hợp lệ.");
            order.ShippingFee = shippingFee;
            order.TotalAmount = totalAmount + shippingFee;
            order.OriginalTotal = order.TotalAmount;
            if (!string.IsNullOrWhiteSpace(dto.VoucherCode))
                await (_vouchers ?? throw new InvalidOperationException("Voucher service unavailable.")).ReserveAsync(order, dto.VoucherCode);
            if (dto.ExpectedTotal.HasValue && dto.ExpectedTotal != order.TotalAmount)
                throw new ArgumentException("Giá đơn hàng vừa thay đổi. Hãy kiểm tra lại báo giá trước khi đặt hàng.");

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
            committed = true;

            if (order.TotalAmount == 0)
            {
                await MarkOrderPaidAsync(order.Id);
            }

            return await GetOrderByIdAsync(order.Id);
        }
        catch (Exception ex) when (ex.GetType().Name == "DbUpdateConcurrencyException")
        {
            if (!committed) await _unitOfWork.RollbackTransactionAsync();
            throw new Exception("Sản phẩm vừa được người khác mua hết.");
        }
        catch (Exception)
        {
            if (!committed) await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task RecordPaidCardPurchaseAsync(
        Guid userId,
        Guid cardId,
        long orderCode,
        int amount,
        string templateSlug,
        DateTime paidAt)
    {
        var existing = await _unitOfWork.Orders.GetByIdWithItemsAsync(cardId);
        if (existing != null)
        {
            if (existing.UserId != userId || existing.OrderKind != "DigitalCard")
            {
                throw new InvalidOperationException("Card purchase conflicts with an existing order.");
            }

            return;
        }

        var user = await _unitOfWork.Users.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("Card owner does not exist in the commerce database.");
        var purchasedAt = paidAt.Kind == DateTimeKind.Utc ? paidAt : paidAt.ToUniversalTime();

        var cardOrder = new Order
        {
            Id = cardId,
            UserId = userId,
            OrderCode = orderCode.ToString(),
            OrderKind = "DigitalCard",
            CardId = cardId,
            CardTemplateSlug = templateSlug,
            PaymentMethod = PaymentMethod.BankTransfer,
            PaymentStatus = PaymentStatus.Paid,
            OrderStatus = OrderStatus.Delivered,
            ReceiverName = new[] { user.DisplayName, user.FullName, user.Email }.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? "CraftVision customer",
            ReceiverAddress = "Online",
            ShippingFee = 0,
            TotalAmount = amount,
            PaidAt = purchasedAt,
            CreatedAt = purchasedAt,
            UpdatedAt = purchasedAt
        };
        cardOrder.FinancialEvents.Add(OrderFinancialEvent.Receipt(cardOrder, purchasedAt));
        _unitOfWork.Orders.Add(cardOrder);

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<OrderDto> GetOrderByIdAsync(Guid id)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(id);
        if (order == null) throw new Exception("Order not found");

        if (order.PaymentMethod == PaymentMethod.BankTransfer && 
            order.TotalAmount > 0 &&
            order.PaymentStatus == PaymentStatus.Unpaid && 
            order.OrderStatus != OrderStatus.Cancelled &&
            (string.IsNullOrEmpty(order.PayOsCheckoutUrl) || order.PayOsCheckoutUrl.Contains("dummy-payment-url")))
        {
            try
            {
                await GeneratePayOsLinkForOrderAsync(order);
            }
            catch
            {
                // Fallback gracefully if PayOS service is temporarily unavailable
            }
        }
        
        return new OrderDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            OrderKind = order.OrderKind,
            CardId = order.CardId,
            CardTemplateSlug = order.CardTemplateSlug,
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            OrderStatus = order.OrderStatus.ToString(),
            ReceiverName = order.ReceiverName,
            ReceiverPhone = order.ReceiverPhone,
            ReceiverAddress = order.ReceiverAddress,
            ShippingFee = order.ShippingFee,
            TotalAmount = order.TotalAmount,
            OriginalTotal = order.OriginalTotal > 0 ? order.OriginalTotal : order.TotalAmount,
            VoucherCode = order.VoucherCode, DiscountPercent = order.DiscountPercent, DiscountAmount = order.DiscountAmount,
            MerchandiseDiscount = order.MerchandiseDiscount, ShippingDiscount = order.ShippingDiscount,
            VoucherUsageStatus = order.VoucherUsage?.Status,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            CheckoutUrl = order.PayOsCheckoutUrl,
            QrCode = order.PayOsQrCode,
            PayOsBin = order.PayOsBin,
            PayOsAccountNumber = order.PayOsAccountNumber,
            PayOsAccountName = order.PayOsAccountName,
            PayOsAmount = (int)order.TotalAmount,
            PayOsDescription = $"CV3D {order.OrderCode}",
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? "",
                ProductType = oi.Product?.ProductType.ToString() ?? "",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.SubTotal,
                ProductImageUrl = oi.Product?.SampleImageUrl,
                Gift = oi.Gift != null ? new GiftSummaryDto
                {
                    Id = oi.Gift.Id,
                    GiftTitle = oi.Gift.GiftTitle,
                    SenderName = oi.Gift.SenderName,
                    ReceiverName = oi.Gift.ReceiverName,
                    NfcTagCode = oi.Gift.NfcTag?.TagCode,
                    SecretKey = oi.Gift.NfcTag?.SecretKey,
                    Status = oi.Gift.NfcTag?.Status.ToString() ?? ""
                } : null
            }).ToList()
        };
    }

    public async Task<PagedResult<OrderDto>> GetUserOrdersAsync(Guid userId, int page, int size)
    {
        var (items, total) = await _unitOfWork.Orders.GetByUserIdAsync(userId, page, size);
        return new PagedResult<OrderDto>
        {
            Items = items.Select(order => new OrderDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                OrderKind = order.OrderKind,
                CardId = order.CardId,
                CardTemplateSlug = order.CardTemplateSlug,
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverAddress = order.ReceiverAddress,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                OriginalTotal = order.OriginalTotal > 0 ? order.OriginalTotal : order.TotalAmount,
                VoucherCode = order.VoucherCode, DiscountPercent = order.DiscountPercent, DiscountAmount = order.DiscountAmount,
                MerchandiseDiscount = order.MerchandiseDiscount, ShippingDiscount = order.ShippingDiscount,
                VoucherUsageStatus = order.VoucherUsage?.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                CheckoutUrl = order.PayOsCheckoutUrl,
                QrCode = order.PayOsQrCode,
                PayOsBin = order.PayOsBin,
                PayOsAccountNumber = order.PayOsAccountNumber,
                PayOsAccountName = order.PayOsAccountName,
                PayOsAmount = (int)order.TotalAmount,
                PayOsDescription = $"CV3D {order.OrderCode}",
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    ProductType = oi.Product?.ProductType.ToString() ?? "",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.SubTotal,
                    ProductImageUrl = oi.Product?.SampleImageUrl,
                    Gift = oi.Gift != null ? new GiftSummaryDto
                    {
                        Id = oi.Gift.Id,
                        GiftTitle = oi.Gift.GiftTitle,
                        SenderName = oi.Gift.SenderName,
                        ReceiverName = oi.Gift.ReceiverName,
                        NfcTagCode = oi.Gift.NfcTag?.TagCode,
                        SecretKey = oi.Gift.NfcTag?.SecretKey,
                        Status = oi.Gift.NfcTag?.Status.ToString() ?? ""
                    } : null
                }).ToList()
            }).ToList(),
            TotalItems = total,
            Page = page,
            PageSize = size
        };
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int size)
    {
        // For simplicity, just use GetByUserIdAsync with empty logic or add a new method in repo.
        // Wait, I need a generic GetAllAsync in repo.
        // Let's implement this quickly directly via context or repository.
        var (items, total) = await _unitOfWork.Orders.GetAllAsync(page, size);
        return new PagedResult<OrderDto>
        {
            Items = items.Select(order => new OrderDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                OrderKind = order.OrderKind,
                CardId = order.CardId,
                CardTemplateSlug = order.CardTemplateSlug,
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverAddress = order.ReceiverAddress,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                OriginalTotal = order.OriginalTotal > 0 ? order.OriginalTotal : order.TotalAmount,
                VoucherCode = order.VoucherCode, DiscountPercent = order.DiscountPercent, DiscountAmount = order.DiscountAmount,
                MerchandiseDiscount = order.MerchandiseDiscount, ShippingDiscount = order.ShippingDiscount,
                VoucherUsageStatus = order.VoucherUsage?.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    ProductType = oi.Product?.ProductType.ToString() ?? "",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SubTotal = oi.SubTotal,
                    ProductImageUrl = oi.Product?.SampleImageUrl,
                    Gift = oi.Gift != null ? new GiftSummaryDto
                    {
                        Id = oi.Gift.Id,
                        GiftTitle = oi.Gift.GiftTitle,
                        SenderName = oi.Gift.SenderName,
                        ReceiverName = oi.Gift.ReceiverName,
                        NfcTagCode = oi.Gift.NfcTag?.TagCode,
                        SecretKey = oi.Gift.NfcTag?.SecretKey,
                        Status = oi.Gift.NfcTag?.Status.ToString() ?? ""
                    } : null
                }).ToList()
            }).ToList(),
            TotalItems = total,
            Page = page,
            PageSize = size
        };
    }

    public async Task UpdateOrderStatusAsync(Guid orderId, string status)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");
        if (order.OrderKind == "DigitalCard")
            throw new InvalidOperationException("Digital card purchase status is managed by its verified payment.");

        if (!Enum.TryParse<OrderStatus>(status, out var newStatus))
        {
            throw new ArgumentException("Invalid status");
        }

        var previousStatus = order.OrderStatus;
        if (order.VoucherCode is not null && previousStatus == OrderStatus.Cancelled && newStatus != OrderStatus.Cancelled)
            throw new InvalidOperationException("Không thể mở lại đơn đã hủy có mã giảm giá. Vui lòng tạo đơn mới.");
        order.OrderStatus = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Orders.Update(order);

        if (newStatus == OrderStatus.Cancelled)
        {
            var items = await _unitOfWork.OrderItems.GetByOrderIdAsync(orderId);
            foreach (var item in items)
            {
                var prod = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
                if (previousStatus != OrderStatus.Cancelled && order.InventoryDeducted && prod != null && prod.ProductType == ProductType.InStock)
                {
                    prod.Stock += item.Quantity;
                    _unitOfWork.Products.Update(prod);
                }

                var gift = await _unitOfWork.Gifts.GetByOrderItemIdAsync(item.Id);
                if (gift != null)
                {
                    var tag = await _unitOfWork.NfcTags.GetByIdAsync(gift.NfcTagId);
                    if (tag != null && tag.Status == NfcStatus.Reserved)
                    {
                        tag.Status = NfcStatus.Available;
                        tag.UpdatedAt = DateTime.UtcNow;
                        _unitOfWork.NfcTags.Update(tag);
                    }
                }
            }
            order.InventoryDeducted = false;
        }
        else if (newStatus == OrderStatus.Shipped || newStatus == OrderStatus.Delivered)
        {
            var items = await _unitOfWork.OrderItems.GetByOrderIdAsync(orderId);
            foreach (var item in items)
            {
                var gift = await _unitOfWork.Gifts.GetByOrderItemIdAsync(item.Id);
                if (gift != null)
                {
                    var tag = await _unitOfWork.NfcTags.GetByIdAsync(gift.NfcTagId);
                    if (tag != null && tag.Status == NfcStatus.Reserved)
                    {
                        tag.Status = NfcStatus.Sold;
                        tag.UpdatedAt = DateTime.UtcNow;
                        _unitOfWork.NfcTags.Update(tag);
                    }
                }
            }
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UpdatePaymentStatusAsync(Guid orderId, string status)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");
        if (order.OrderKind == "DigitalCard")
            throw new InvalidOperationException("Digital card payment status cannot be changed manually.");

        if (!Enum.TryParse<PaymentStatus>(status, out var newStatus))
        {
            throw new ArgumentException("Invalid payment status");
        }

        if (newStatus == PaymentStatus.Paid)
        {
            if (order.VoucherCode is not null && order.PaymentMethod == PaymentMethod.BankTransfer && order.TotalAmount > 0 &&
                (!long.TryParse(order.OrderCode, out var code) || !await _payOsService.VerifyPaymentAsync(code, order.TotalAmount)))
                throw new InvalidOperationException("PayOS chưa xác nhận đủ số tiền thanh toán.");
            await MarkOrderPaidAsync(orderId);
            return;
        }

        if (newStatus == order.PaymentStatus) return;
        if (newStatus == PaymentStatus.Refunded)
        {
            if (order.PaymentStatus != PaymentStatus.Paid)
                throw new InvalidOperationException("Chỉ hoàn tiền cho đơn đã thanh toán. Thao tác này xác nhận đã hoàn toàn bộ tiền.");
            var receipt = order.FinancialEvents.SingleOrDefault(e => e.Kind == "Receipt")
                ?? OrderFinancialEvent.Receipt(order, order.PaidAt);
            if (!order.FinancialEvents.Contains(receipt)) _unitOfWork.Orders.AddFinancialEvent(order, receipt);
            order.RefundedAt = DateTime.UtcNow;
            _unitOfWork.Orders.AddFinancialEvent(order, receipt.Refund(order.RefundedAt.Value));
        }
        else if (order.PaymentStatus is PaymentStatus.Paid or PaymentStatus.Refunded)
            throw new InvalidOperationException("Không thể đổi khoản đã thu/hoàn về chưa thanh toán. Lịch sử giao dịch phải được giữ nguyên.");

        order.PaymentStatus = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Orders.Update(order);

        await _unitOfWork.SaveChangesAsync();
    }


    public async Task CompleteUserOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");
        
        if (order.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật đơn hàng này.");
        }

        if (order.OrderStatus == OrderStatus.Delivered)
        {
            throw new InvalidOperationException("Đơn hàng này đã hoàn thành.");
        }
        if (order.VoucherCode is not null && order.OrderStatus != OrderStatus.Shipped)
            throw new InvalidOperationException("Chỉ xác nhận nhận hàng khi đơn đang giao.");

        order.OrderStatus = OrderStatus.Delivered;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Orders.Update(order);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task CancelUserOrderAsync(Guid userId, Guid orderId)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");
        
        if (order.UserId != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Processing && order.OrderStatus != OrderStatus.WaitingProduction)
        {
            throw new InvalidOperationException("Chỉ có thể hủy đơn hàng đang chờ xử lý.");
        }

        order.OrderStatus = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        
        // Restore inventory only when this order actually deducted it.
        foreach (var item in order.OrderItems)
        {
            if (order.InventoryDeducted && item.Product != null && item.Product.ProductType == ProductType.InStock)
            {
                item.Product.Stock += item.Quantity;
                _unitOfWork.Products.Update(item.Product);
            }
            
            var gift = await _unitOfWork.Gifts.GetByOrderItemIdAsync(item.Id);
            if (gift != null)
            {
                var tag = await _unitOfWork.NfcTags.GetByIdAsync(gift.NfcTagId);
                if (tag != null && tag.Status == NfcStatus.Reserved)
                {
                    tag.Status = NfcStatus.Available;
                    tag.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.NfcTags.Update(tag);
                }
            }
        }
        order.InventoryDeducted = false;

        _unitOfWork.Orders.Update(order);
        await _unitOfWork.SaveChangesAsync();
    }

    private string GenerateOrderCode()
    {
        var random = new Random();
        string suffix = random.Next(100, 999).ToString();
        return $"{DateTime.UtcNow:yyMMddHHmmss}{suffix}";
    }

    public static decimal CalculateShippingFee(string? address, decimal subtotal)
    {
        if (subtotal >= 500000 || string.IsNullOrWhiteSpace(address) || string.Equals(address, "Online", StringComparison.OrdinalIgnoreCase))
        {
            return 0;
        }

        var addr = address.ToLowerInvariant();
        bool isHcm = addr.Contains("hồ chí minh") || addr.Contains("ho chi minh") || addr.Contains("hcm") || addr.Contains("tphcm");

        if (isHcm)
        {
            // Các huyện ngoại thành TP.HCM: Bình Chánh, Hóc Môn, Củ Chi, Nhà Bè, Cần Giờ
            bool isSuburban = addr.Contains("bình chánh") || addr.Contains("binh chanh") ||
                              addr.Contains("hóc môn") || addr.Contains("hoc mon") ||
                              addr.Contains("củ chi") || addr.Contains("cu chi") ||
                              addr.Contains("nhà bè") || addr.Contains("nha be") ||
                              addr.Contains("cần giờ") || addr.Contains("can gio");

            return isSuburban ? 30000 : 20000;
        }

        // Ngoại tỉnh
        return 35000;
    }

    public async Task DeleteOrderAsync(Guid id)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(id);
        if (order == null) throw new Exception("Order not found");
        order.IsArchived = true;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Orders.Update(order);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> CheckAndUpdatePaymentStatusAsync(Guid orderId)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");

        if (order.PaymentStatus == PaymentStatus.Paid) return true;

        if (long.TryParse(order.OrderCode, out long orderCodeLong))
        {
            bool isPaid = order.VoucherCode is null
                ? await _payOsService.CheckPaymentStatusAsync(orderCodeLong)
                : await _payOsService.VerifyPaymentAsync(orderCodeLong, order.TotalAmount);
            if (isPaid)
            {
                await MarkOrderPaidAsync(orderId);
                return true;
            }
        }
        return false;
    }

    public async Task SimulatePaymentAsync(Guid orderId)
    {
        await MarkOrderPaidAsync(orderId);
    }

    public async Task MarkOrderPaidByCodeAsync(string orderCode)
    {
        var order = await _unitOfWork.Orders.GetByOrderCodeAsync(orderCode);
        if (order == null) throw new Exception("Order not found");
        if (order.VoucherCode is not null && order.TotalAmount > 0 &&
            (!long.TryParse(orderCode, out var code) || !await _payOsService.VerifyPaymentAsync(code, order.TotalAmount)))
            throw new InvalidOperationException("Thanh toán không khớp với đơn hàng.");
        await MarkOrderPaidAsync(order.Id);
    }

    private async Task MarkOrderPaidAsync(Guid orderId)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
            if (order == null) throw new Exception("Order not found");
            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                await _unitOfWork.CommitTransactionAsync();
                return;
            }
            if (order.PaymentStatus == PaymentStatus.Refunded)
                throw new InvalidOperationException("Đơn đã hoàn tiền không thể được ghi nhận thanh toán lại.");
            var lateVoucherPayment = order.OrderStatus == OrderStatus.Cancelled && order.VoucherCode is not null &&
                order.PaymentMethod == PaymentMethod.BankTransfer;
            if (order.OrderStatus == OrderStatus.Cancelled && !lateVoucherPayment)
                throw new InvalidOperationException("Không thể thanh toán đơn hàng đã bị huỷ.");

            if (!lateVoucherPayment && !order.InventoryDeducted && order.OrderKind != "DigitalCard")
            {
                var inStockItems = order.OrderItems
                    .Where(item => item.Product?.ProductType == ProductType.InStock)
                    .ToList();

                foreach (var item in inStockItems)
                {
                    if (item.Product!.Stock < item.Quantity)
                        throw new InvalidOperationException($"Sản phẩm '{item.Product.Name}' không đủ số lượng tại thời điểm thanh toán.");
                }

                foreach (var item in inStockItems)
                {
                    item.Product!.Stock -= item.Quantity;
                    item.Product.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.Products.Update(item.Product);
                }

                order.InventoryDeducted = true;
            }

            order.PaymentStatus = PaymentStatus.Paid;
            order.PaidAt = DateTime.UtcNow;
            _unitOfWork.Orders.AddFinancialEvent(order, OrderFinancialEvent.Receipt(order, order.PaidAt));
            order.OrderStatus = lateVoucherPayment ? OrderStatus.Cancelled
                : order.OrderKind == "DigitalCard" || order.OrderStatus == OrderStatus.Delivered
                ? OrderStatus.Delivered
                : order.OrderItems.Any(item => item.Product?.ProductType == ProductType.PreOrder)
                    ? OrderStatus.WaitingProduction
                    : OrderStatus.Processing;
            order.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Orders.Update(order);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<OrderDto> GetOrRegeneratePaymentLinkAsync(Guid orderId)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(orderId);
        if (order == null) throw new Exception("Order not found");
        if (order.VoucherUsage is { Status: "Reserved", ExpiresAt: not null } usage && usage.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidOperationException("Thời gian giữ mã đã hết. Vui lòng kiểm tra thanh toán hoặc chờ đơn được hủy.");

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            return await GetOrderByIdAsync(orderId);
        }

        if (order.OrderStatus == OrderStatus.Cancelled)
        {
            throw new InvalidOperationException("Đơn hàng này đã bị huỷ.");
        }

        await GeneratePayOsLinkForOrderAsync(order);
        return await GetOrderByIdAsync(orderId);
    }

    private async Task GeneratePayOsLinkForOrderAsync(Order order)
    {
        var voucherTransaction = order.VoucherCode is not null;
        if (voucherTransaction) await _unitOfWork.BeginTransactionAsync();
        try
        {
            if (voucherTransaction)
                await (_vouchers ?? throw new InvalidOperationException("Voucher service unavailable.")).EnsurePayableAsync(order);
            await CreateAndSavePayOsLinkAsync(order);
            if (voucherTransaction) await _unitOfWork.CommitTransactionAsync();
        }
        catch
        {
            if (voucherTransaction) await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    private async Task CreateAndSavePayOsLinkAsync(Order order)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        string returnUrl = $"{frontendUrl}/payment/success";
        string cancelUrl = $"{frontendUrl}/payment/cancel";

        if (!long.TryParse(order.OrderCode, out long orderCodeLong))
        {
            order.OrderCode = GenerateOrderCode();
            orderCodeLong = long.Parse(order.OrderCode);
        }

        var paymentInfo = await _payOsService.CreatePaymentLinkAsync(
            order.Id,
            orderCodeLong,
            order.TotalAmount,
            $"Thanh toan CV3D {order.OrderCode}",
            returnUrl,
            cancelUrl
        );

        if (order.VoucherCode is null && (string.IsNullOrEmpty(paymentInfo.CheckoutUrl) || paymentInfo.CheckoutUrl.Contains("dummy-payment-url")))
        {
            order.OrderCode = GenerateOrderCode();
            orderCodeLong = long.Parse(order.OrderCode);
            paymentInfo = await _payOsService.CreatePaymentLinkAsync(
                order.Id,
                orderCodeLong,
                order.TotalAmount,
                $"Thanh toan CV3D {order.OrderCode}",
                returnUrl,
                cancelUrl
            );
        }

        order.PayOsCheckoutUrl = paymentInfo.CheckoutUrl;
        order.PayOsQrCode = paymentInfo.QrCode;
        order.PayOsBin = paymentInfo.Bin;
        order.PayOsAccountNumber = paymentInfo.AccountNumber;
        order.PayOsAccountName = paymentInfo.AccountName;
        order.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Orders.Update(order);
        await _unitOfWork.SaveChangesAsync();
    }
}
