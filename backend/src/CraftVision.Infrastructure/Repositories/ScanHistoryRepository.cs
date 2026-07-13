using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class ScanHistoryRepository : IScanHistoryRepository
{
    private readonly ApplicationDbContext _context;

    public ScanHistoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ScanHistory>> GetByGiftIdAsync(Guid giftId)
    {
        return await _context.Set<ScanHistory>().Where(x => x.GiftId == giftId).ToListAsync();
    }

    public void Add(ScanHistory history)
    {
        _context.Set<ScanHistory>().Add(history);
    }
}
