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
        if (_context.Database.CurrentTransaction is null)
            throw new InvalidOperationException("Reserving an NFC tag requires an order transaction.");

        // Cancelled orders retain their gifts. Never assign their tags to another gift.
        // Claim immediately so concurrent orders and unsaved items cannot select the same tag.
        var tags = await _context.Set<NfcTag>().FromSqlRaw("""
            SELECT n.* FROM nfc_tags AS n
            WHERE n.status = 'Available'
              AND NOT EXISTS (SELECT 1 FROM gifts AS g WHERE g.nfc_tag_id = n.id)
            ORDER BY n.created_at, n.id
            LIMIT 1 FOR UPDATE OF n SKIP LOCKED
            """).AsTracking().ToListAsync();
        var tag = tags.FirstOrDefault();
        if (tag is null) return null;
        await _context.NfcTags.Where(n => n.Id == tag.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Status, CraftVision.Domain.Enums.NfcStatus.Reserved));
        tag.Status = CraftVision.Domain.Enums.NfcStatus.Reserved;
        return tag;
    }

    public void Add(NfcTag tag)
    {
        _context.Set<NfcTag>().Add(tag);
    }

    public void Update(NfcTag tag)
    {
        _context.Set<NfcTag>().Update(tag);
    }

    public void Remove(NfcTag tag)
    {
        _context.Set<NfcTag>().Remove(tag);
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
