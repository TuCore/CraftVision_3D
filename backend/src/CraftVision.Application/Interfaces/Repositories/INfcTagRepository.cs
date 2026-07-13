using System;
using System.Threading.Tasks;
using CraftVision.Domain.Entities;

namespace CraftVision.Application.Interfaces.Repositories;

public interface INfcTagRepository
{
    Task<NfcTag?> GetByIdAsync(Guid id);
    Task<NfcTag?> GetBySecretKeyAsync(string secretKey);
    Task<NfcTag?> GetByTagCodeAsync(string tagCode);
    Task<NfcTag?> GetFirstAvailableAsync();
    void Add(NfcTag tag);
    void Update(NfcTag tag);
    Task<System.Collections.Generic.IEnumerable<NfcTag>> GetAllWithDetailsAsync();
}
