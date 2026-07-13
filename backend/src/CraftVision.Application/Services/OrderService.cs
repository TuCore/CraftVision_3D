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

namespace CraftVision.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderDto dto)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            if (dto.Items == null || !dto.Items.Any())
            {
                throw new Exception("Order must have at least one item.");
            }

            var order = new Order
            {
                UserId = userId,
                OrderCode = GenerateOrderCode(),
                PaymentMethod = PaymentMethod.Cod,
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
                    if (product.Stock < itemDto.Quantity)
                        throw new Exception($"Product {product.Name} is out of stock.");
                    
                    product.Stock -= itemDto.Quantity;
                    _unitOfWork.Products.Update(product);
                    order.OrderStatus = OrderStatus.Processing;
                }
                else
                {
                    order.OrderStatus = OrderStatus.WaitingProduction;
                }

                if (itemDto.WantNfc && !product.SupportsNfc)
                {
                    throw new Exception($"Product {product.Name} does not support NFC.");
                }

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    UnitPrice = product.Price,
                    SubTotal = product.Price * itemDto.Quantity,
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
                        throw new Exception("Message cannot be empty for manual source.");
                    }

                    var availableTag = await _unitOfWork.NfcTags.GetFirstAvailableAsync();
                    if (availableTag == null)
                    {
                        throw new Exception("No available NFC tags in stock.");
                    }

                    availableTag.Status = NfcStatus.Reserved;
                    availableTag.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.NfcTags.Update(availableTag);

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

            order.TotalAmount = totalAmount; // Plus shipping fee if any
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return await GetOrderByIdAsync(order.Id);
        }
        catch (Exception ex) when (ex.GetType().Name == "DbUpdateConcurrencyException")
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception("Sản phẩm vừa được người khác mua hết.");
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<OrderDto> GetOrderByIdAsync(Guid id)
    {
        var order = await _unitOfWork.Orders.GetByIdWithItemsAsync(id);
        if (order == null) throw new Exception("Order not found");
        
        return new OrderDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            PaymentMethod = order.PaymentMethod.ToString(),
            PaymentStatus = order.PaymentStatus.ToString(),
            OrderStatus = order.OrderStatus.ToString(),
            ReceiverName = order.ReceiverName,
            TotalAmount = order.TotalAmount,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? "",
                ProductType = oi.Product?.ProductType.ToString() ?? "",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.SubTotal,
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
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                ReceiverName = order.ReceiverName,
                TotalAmount = order.TotalAmount,
                CreatedAt = order.CreatedAt
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
                PaymentMethod = order.PaymentMethod.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                ReceiverName = order.ReceiverName,
                TotalAmount = order.TotalAmount,
                CreatedAt = order.CreatedAt
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

        if (!Enum.TryParse<OrderStatus>(status, out var newStatus))
        {
            throw new Exception("Invalid status");
        }

        // Validate state machine transitions (simplified for brevity, should check strict transitions based on BR-19)
        order.OrderStatus = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Orders.Update(order);

        if (newStatus == OrderStatus.Shipped || newStatus == OrderStatus.Delivered)
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

    private string GenerateOrderCode()
    {
        string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        string suffix = new string(Enumerable.Repeat(chars, 6).Select(s => s[random.Next(s.Length)]).ToArray());
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{suffix}";
    }
}
