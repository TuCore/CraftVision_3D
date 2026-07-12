using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IGiftMediaRepository
{
    Task<IEnumerable<GiftMedia>> GetByGiftIdAsync(Guid giftId);
    void AddRange(IEnumerable<GiftMedia> mediaList);
}
