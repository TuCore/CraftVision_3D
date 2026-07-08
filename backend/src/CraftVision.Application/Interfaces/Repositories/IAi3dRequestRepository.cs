using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IAi3dRequestRepository
{
    Task AddAsync(Ai3dRequest entity);
    Task<Ai3dRequest?> GetByIdempotencyKeyAsync(string idempotencyKey);
}
