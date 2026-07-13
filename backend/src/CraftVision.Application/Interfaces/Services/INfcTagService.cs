using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.NfcTag;

namespace CraftVision.Application.Interfaces;

public interface INfcTagService
{
    Task<NfcImportResultDto> ImportTagsAsync(ImportNfcTagDto dto);
    Task<NfcTagDto> GetTagByCodeAsync(string tagCode);
    Task UpdateTagStatusAsync(Guid tagId, string status);
    
    // Admin Endpoints
    Task<System.Collections.Generic.IEnumerable<AdminNfcTagDto>> GetAllAdminTagsAsync();
    Task SimulateScanAsync(string tagCode);
    Task ResetScanCountAsync(string tagCode);
    Task UpdateTagStatusByCodeAsync(string tagCode, string status);
}
