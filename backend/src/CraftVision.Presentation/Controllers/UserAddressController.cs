using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.UserAddress;
using CraftVision.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CraftVision.Presentation.Controllers
{
    [ApiController]
    [Route("api/user/addresses")]
    [Authorize]
    public class UserAddressController : ControllerBase
    {
        private readonly IUserAddressService _addressService;

        public UserAddressController(IUserAddressService addressService)
        {
            _addressService = addressService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString))
                throw new UnauthorizedAccessException("Không tìm thấy thông tin User.");
            return Guid.Parse(userIdString);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var userId = GetUserId();
            var addresses = await _addressService.GetUserAddressesAsync(userId);
            return Ok(addresses);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateUserAddressDto dto)
        {
            var userId = GetUserId();
            var result = await _addressService.CreateAddressAsync(userId, dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateUserAddressDto dto)
        {
            var userId = GetUserId();
            var result = await _addressService.UpdateAddressAsync(userId, id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            var userId = GetUserId();
            await _addressService.DeleteAddressAsync(userId, id);
            return Ok(new { message = "Address deleted successfully" });
        }

        [HttpPut("{id}/default")]
        public async Task<IActionResult> SetDefaultAddress(Guid id)
        {
            var userId = GetUserId();
            await _addressService.SetDefaultAddressAsync(userId, id);
            return Ok(new { message = "Set default address successfully" });
        }
    }
}
