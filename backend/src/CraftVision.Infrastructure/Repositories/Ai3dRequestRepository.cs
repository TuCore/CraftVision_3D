using System.Threading.Tasks;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class Ai3dRequestRepository : IAi3dRequestRepository
{
    private readonly ApplicationDbContext _context;

    public Ai3dRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Ai3dRequest entity)
    {
        await _context.Ai3dRequests.AddAsync(entity);
    }

    public async Task<Ai3dRequest?> GetByIdempotencyKeyAsync(string idempotencyKey)
    {
        return await _context.Ai3dRequests.FirstOrDefaultAsync(x => x.IdempotencyKey == idempotencyKey);
    }
}
