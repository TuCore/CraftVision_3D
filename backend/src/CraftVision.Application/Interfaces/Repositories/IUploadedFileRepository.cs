using System;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IUploadedFileRepository
{
    Task<UploadedFile?> GetByIdAsync(Guid id);
    Task AddAsync(UploadedFile file);
}
