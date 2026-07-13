using System;
using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class NfcTagRepository : INfcTagRepository
{
    private readonly ApplicationDbContext _context;

    public NfcTagRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NfcTag?> GetByIdAsync(Guid id)
    {
        return await _context.Set<NfcTag>().FindAsync(id);
    }

    public async Task<NfcTag?> GetBySecretKeyAsync(string secretKey)
    {
        return await _context.Set<NfcTag>().FirstOrDefaultAsync(x => x.SecretKey == secretKey);
    }

    public async Task<NfcTag?> GetByTagCodeAsync(string tagCode)
    {
        return await _context.Set<NfcTag>().FirstOrDefaultAsync(x => x.TagCode == tagCode);
    }

    public async Task<NfcTag?> GetFirstAvailableAsync()
    {
        return await _context.Set<NfcTag>().FirstOrDefaultAsync(x => x.Status == CraftVision.Domain.Enums.NfcStatus.Available);
    }

    public void Add(NfcTag tag)
    {
        _context.Set<NfcTag>().Add(tag);
    }

    public void Update(NfcTag tag)
    {
        _context.Set<NfcTag>().Update(tag);
    }

    public async Task<System.Collections.Generic.IEnumerable<NfcTag>> GetAllWithDetailsAsync()
    {
        return await _context.Set<NfcTag>()
            .Include(t => t.Gift)
                .ThenInclude(g => g.OrderItem)
                    .ThenInclude(oi => oi.Order)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
}
