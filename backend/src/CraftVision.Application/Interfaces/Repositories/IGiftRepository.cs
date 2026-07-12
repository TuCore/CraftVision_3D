using System;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IGiftRepository
{
    Task<Gift?> GetByIdAsync(Guid id);
    Task<Gift?> GetByNfcSecretKeyAsync(string secretKey);
    Task<Gift?> GetByOrderItemIdAsync(Guid orderItemId);
    void Add(Gift gift);
    void Update(Gift gift);
}
