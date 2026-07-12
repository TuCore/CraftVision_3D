using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class GiftMediaRepository : IGiftMediaRepository
{
    private readonly ApplicationDbContext _context;

    public GiftMediaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GiftMedia>> GetByGiftIdAsync(Guid giftId)
    {
        return await _context.Set<GiftMedia>().Where(x => x.GiftId == giftId).ToListAsync();
    }

    public void AddRange(IEnumerable<GiftMedia> mediaList)
    {
        _context.Set<GiftMedia>().AddRange(mediaList);
    }
}
