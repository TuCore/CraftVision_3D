using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Wishlist;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/wishlists")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("User must be logged in.");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var wishlist = await _wishlistService.GetWishlistAsync(GetUserId());
        return Ok(wishlist);
    }

    [HttpPost]
    public async Task<IActionResult> AddItem([FromBody] AddWishlistItemDto dto)
    {
        var wishlist = await _wishlistService.AddItemAsync(GetUserId(), dto);
        return Ok(wishlist);
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId)
    {
        var wishlist = await _wishlistService.RemoveItemAsync(GetUserId(), productId);
        return Ok(wishlist);
    }
}
