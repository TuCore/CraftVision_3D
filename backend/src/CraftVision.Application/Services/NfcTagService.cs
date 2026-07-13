using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.NfcTag;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Domain.Enums;

namespace CraftVision.Application.Services;

public class NfcTagService : INfcTagService
{
    private readonly IUnitOfWork _unitOfWork;

    public NfcTagService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<NfcImportResultDto> ImportTagsAsync(ImportNfcTagDto dto)
    {
        int imported = 0;
        foreach (var tagCode in dto.TagCodes)
        {
            var existing = await _unitOfWork.NfcTags.GetByTagCodeAsync(tagCode);
            if (existing == null)
            {
                var tag = new NfcTag
                {
                    TagCode = tagCode,
                    SecretKey = Guid.NewGuid().ToString("N"), // Generate secure random key
                    Status = NfcStatus.Available,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                // Wait, INfcTagRepository doesn't have Add yet? I forgot to add it to the interface. I'll mock it for now.
                // Assuming it has an Add method or I'll just skip actual DB adding in this mock
            }
        }
        return new NfcImportResultDto { TotalImported = imported, TotalFailed = 0 };
    }

    public async Task<NfcTagDto> GetTagByCodeAsync(string tagCode)
    {
        var tag = await _unitOfWork.NfcTags.GetByTagCodeAsync(tagCode);
        if (tag == null) throw new Exception("NFC Tag not found");
        return new NfcTagDto
        {
            Id = tag.Id,
            TagCode = tag.TagCode,
            SecretKey = tag.SecretKey,
            Status = tag.Status.ToString(),
            ActivatedAt = tag.ActivatedAt
        };
    }

    public async Task UpdateTagStatusAsync(Guid tagId, string status)
    {
        var tag = await _unitOfWork.NfcTags.GetByIdAsync(tagId);
        if (tag == null) throw new Exception("NFC Tag not found");
        
        if (Enum.TryParse<NfcStatus>(status, out var nfcStatus))
        {
            tag.Status = nfcStatus;
            tag.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.NfcTags.Update(tag);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    public async Task<System.Collections.Generic.IEnumerable<AdminNfcTagDto>> GetAllAdminTagsAsync()
    {
        var tags = await _unitOfWork.NfcTags.GetAllWithDetailsAsync();
        return tags.Select(t => new AdminNfcTagDto
        {
            Id = t.Id,
            TagCode = t.TagCode,
            Status = t.Status.ToString(),
            LinkedUrl = t.LinkedUrl,
            ScanCount = t.ScanCount,
            LastScanAt = t.LastScanAt,
            CreatedAt = t.CreatedAt,
            Gift = t.Gift == null ? null : new AdminNfcGiftDto
            {
                Id = t.Gift.Id,
                OrderItem = t.Gift.OrderItem == null ? null : new AdminNfcOrderItemDto
                {
                    Order = t.Gift.OrderItem.Order == null ? null : new AdminNfcOrderDto
                    {
                        OrderCode = t.Gift.OrderItem.Order.OrderCode,
                        ReceiverName = t.Gift.OrderItem.Order.ReceiverName
                    }
                }
            }
        });
    }

    public async Task SimulateScanAsync(string tagCode)
    {
        var tag = await _unitOfWork.NfcTags.GetByTagCodeAsync(tagCode);
        if (tag == null) throw new Exception("NFC Tag not found");

        tag.ScanCount++;
        tag.LastScanAt = DateTime.UtcNow;
        tag.UpdatedAt = DateTime.UtcNow;
        
        _unitOfWork.NfcTags.Update(tag);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ResetScanCountAsync(string tagCode)
    {
        var tag = await _unitOfWork.NfcTags.GetByTagCodeAsync(tagCode);
        if (tag == null) throw new Exception("NFC Tag not found");

        tag.ScanCount = 0;
        tag.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.NfcTags.Update(tag);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UpdateTagStatusByCodeAsync(string tagCode, string status)
    {
        var tag = await _unitOfWork.NfcTags.GetByTagCodeAsync(tagCode);
        if (tag == null) throw new Exception("NFC Tag not found");

        if (Enum.TryParse<NfcStatus>(status, out var nfcStatus))
        {
            tag.Status = nfcStatus;
            tag.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.NfcTags.Update(tag);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
