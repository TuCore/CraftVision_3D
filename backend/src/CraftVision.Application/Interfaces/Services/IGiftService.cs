using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Gift;

namespace CraftVision.Application.Interfaces;

public interface IGiftService
{
    Task<GiftPageDto> GetGiftPageBySecretKeyAsync(string secretKey);
}
