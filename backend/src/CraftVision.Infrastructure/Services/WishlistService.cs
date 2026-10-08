using System;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Product;
using CraftVision.Application.DTOs.Wishlist;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Services;

public class WishlistService : IWishlistService
{
    private readonly ApplicationDbContext _context;

    public WishlistService(ApplicationDbContext context)
    {
        _context = context;
    }

    private WishlistDto MapToDto(Wishlist wishlist)
    {
        return new WishlistDto
        {
            Id = wishlist.Id,
            UserId = wishlist.UserId,
            CreatedAt = wishlist.CreatedAt,
            UpdatedAt = wishlist.UpdatedAt,
            Items = wishlist.Items.Select(i => new WishlistItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                CreatedAt = i.CreatedAt,
                Product = new ProductDto
                {
                    Id = i.Product.Id,
                    Name = i.Product.Name,
                    Description = i.Product.Description,
                    Price = i.Product.Price,
                    Stock = i.Product.Stock,
                    ThumbnailUrl = i.Product.ProductImages.FirstOrDefault(pi => pi.IsThumbnail)?.File?.FileUrl ?? i.Product.SampleImageUrl,
                    SampleImageUrl = i.Product.SampleImageUrl,
                    Images = i.Product.ProductImages.Select(pi => pi.File?.FileUrl ?? "").Where(u => !string.IsNullOrEmpty(u)).ToList(),
                    ProductType = i.Product.ProductType.ToString(),
                    SupportsNfc = i.Product.SupportsNfc,
                    IsComingSoon = i.Product.IsComingSoon
                }
            }).ToList()
        };
    }

    public async Task<WishlistDto> GetWishlistAsync(Guid userId)
    {
        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = userId };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        return MapToDto(wishlist);
    }

    public async Task<WishlistDto> AddItemAsync(Guid userId, AddWishlistItemDto dto)
    {
        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wishlist == null)
        {
            wishlist = new Wishlist { UserId = userId };
            _context.Wishlists.Add(wishlist);
        }

        if (!wishlist.Items.Any(i => i.ProductId == dto.ProductId))
        {
            wishlist.Items.Add(new WishlistItem
            {
                ProductId = dto.ProductId
            });
            wishlist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            // Clear tracker so EF Core fetches the Product from the database
            _context.ChangeTracker.Clear();
            
            // Reload for product details
            var savedWishlist = await _context.Wishlists
                .Include(w => w.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.ProductImages)
                            .ThenInclude(pi => pi.File)
                .FirstOrDefaultAsync(w => w.Id == wishlist.Id);
            return MapToDto(savedWishlist!);
        }

        return MapToDto(wishlist);
    }

    public async Task<WishlistDto> RemoveItemAsync(Guid userId, Guid productId)
    {
        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
                        .ThenInclude(pi => pi.File)
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wishlist == null) throw new Exception("Wishlist not found");

        var item = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            wishlist.Items.Remove(item);
            wishlist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return MapToDto(wishlist);
    }
}
