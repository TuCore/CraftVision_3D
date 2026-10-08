using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Cart;
using CraftVision.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("User must be logged in.");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCartAsync(GetUserId());
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartDto dto)
    {
        var cart = await _cartService.AddItemAsync(GetUserId(), dto);
        return Ok(cart);
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateCartItemDto dto)
    {
        var cart = await _cartService.UpdateItemAsync(GetUserId(), id, dto);
        return Ok(cart);
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id)
    {
        var cart = await _cartService.RemoveItemAsync(GetUserId(), id);
        return Ok(cart);
    }
}
