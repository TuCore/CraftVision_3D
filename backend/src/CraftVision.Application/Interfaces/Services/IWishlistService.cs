using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Wishlist;

namespace CraftVision.Application.Interfaces.Services;

public interface IWishlistService
{
    Task<WishlistDto> GetWishlistAsync(Guid userId);
    Task<WishlistDto> AddItemAsync(Guid userId, AddWishlistItemDto dto);
    Task<WishlistDto> RemoveItemAsync(Guid userId, Guid productId);
}
