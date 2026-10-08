using System;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Cart;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;

    public CartService(ApplicationDbContext context)
    {
        _context = context;
    }

    private CartDto MapToDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                ProductImageUrl = i.Product.ProductImages.FirstOrDefault(pi => pi.IsThumbnail)?.File?.FileUrl ?? i.Product.SampleImageUrl ?? "",
                Price = i.Product.Price,
                Quantity = i.Quantity,
                SelectedOptions = i.SelectedOptions
            }).ToList()
        };
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId && i.SelectedOptions == dto.SelectedOptions);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                SelectedOptions = dto.SelectedOptions
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        _context.ChangeTracker.Clear();

        // Reload to get product details
        var savedCart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(c => c.Id == cart.Id);

        return MapToDto(savedCart!);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) throw new Exception("Cart not found");

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item == null) throw new Exception("Cart item not found");

        if (dto.Quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            item.Quantity = dto.Quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(cart);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid cartItemId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) throw new Exception("Cart not found");

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item != null)
        {
            cart.Items.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return MapToDto(cart);
    }

    public async Task ClearCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart != null)
        {
            cart.Items.Clear();
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
