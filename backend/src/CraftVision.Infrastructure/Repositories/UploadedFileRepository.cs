using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class UploadedFileRepository : IUploadedFileRepository
{
    private readonly ApplicationDbContext _context;

    public UploadedFileRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UploadedFile?> GetByIdAsync(Guid id)
    {
        return await _context.UploadedFiles.FindAsync(id);
    }

    public async Task AddAsync(UploadedFile file)
    {
        await _context.UploadedFiles.AddAsync(file);
    }
}
