using System;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IGiftAiProfileRepository
{
    Task<GiftAiProfile?> GetByGiftIdAsync(Guid giftId);
    void Add(GiftAiProfile profile);
}
