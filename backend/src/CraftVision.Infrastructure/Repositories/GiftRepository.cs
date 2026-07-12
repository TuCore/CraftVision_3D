using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class GiftRepository : IGiftRepository
{
    private readonly ApplicationDbContext _context;

    public GiftRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Gift?> GetByIdAsync(Guid id)
    {
        return await _context.Set<Gift>().FindAsync(id);
    }

    public async Task<Gift?> GetByNfcSecretKeyAsync(string secretKey)
    {
        return await _context.Set<Gift>()
            .Include(g => g.NfcTag)
            .Include(g => g.ScanHistories)
            .FirstOrDefaultAsync(g => g.NfcTag != null && g.NfcTag.SecretKey == secretKey);
    }

    public async Task<Gift?> GetByOrderItemIdAsync(Guid orderItemId)
    {
        return await _context.Set<Gift>().FirstOrDefaultAsync(g => g.OrderItemId == orderItemId);
    }

    public void Add(Gift gift)
    {
        _context.Set<Gift>().Add(gift);
    }

    public void Update(Gift gift)
    {
        _context.Set<Gift>().Update(gift);
    }
}
