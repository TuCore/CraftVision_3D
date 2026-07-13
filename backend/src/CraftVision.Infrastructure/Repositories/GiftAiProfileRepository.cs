using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class GiftAiProfileRepository : IGiftAiProfileRepository
{
    private readonly ApplicationDbContext _context;

    public GiftAiProfileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GiftAiProfile?> GetByGiftIdAsync(Guid giftId)
    {
        return await _context.Set<GiftAiProfile>().FirstOrDefaultAsync(x => x.GiftId == giftId);
    }

    public void Add(GiftAiProfile profile)
    {
        _context.Set<GiftAiProfile>().Add(profile);
    }
}
