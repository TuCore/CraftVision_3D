using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.NfcTag;

namespace CraftVision.Application.Interfaces;

public interface INfcTagService
{
    Task<NfcImportResultDto> ImportTagsAsync(ImportNfcTagDto dto);
    Task<NfcTagDto> GetTagByCodeAsync(string tagCode);
    Task UpdateTagStatusAsync(Guid tagId, string status);
}
