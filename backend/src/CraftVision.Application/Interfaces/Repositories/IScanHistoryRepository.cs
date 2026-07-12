using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface IScanHistoryRepository
{
    Task<IEnumerable<ScanHistory>> GetByGiftIdAsync(Guid giftId);
    void Add(ScanHistory history);
}
