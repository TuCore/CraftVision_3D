using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Gift;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;

namespace CraftVision.Application.Services;

public class GiftService : IGiftService
{
    private readonly IUnitOfWork _unitOfWork;

    public GiftService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<GiftPageDto> GetGiftPageBySecretKeyAsync(string secretKey)
    {
        var gift = await _unitOfWork.Gifts.GetByNfcSecretKeyAsync(secretKey);
        if (gift == null) throw new Exception("Gift not found");

        var scan = new Domain.Entities.ScanHistory
        {
            GiftId = gift.Id,
            ScannedAt = DateTime.UtcNow
        };
        _unitOfWork.ScanHistories.Add(scan);
        await _unitOfWork.SaveChangesAsync();

        return new GiftPageDto
        {
            GiftTitle = gift.GiftTitle,
            SenderName = gift.SenderName,
            ReceiverName = gift.ReceiverName,
            Message = gift.Message,
            Theme = gift.Theme,
            ThreeDModelUrl = gift.ThreeDModelUrl,
            PreviewImageUrl = gift.PreviewImageUrl,
            ThreeDModelType = gift.ThreeDModelType?.ToString(),
            ScanCount = gift.ScanHistories.Count + 1
        };
    }
}
