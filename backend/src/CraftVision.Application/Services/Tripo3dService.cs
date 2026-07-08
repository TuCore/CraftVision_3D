using System;
using System.Threading;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using CraftVision.Application.Interfaces.AI.Tripo;
using Microsoft.Extensions.Logging;

namespace CraftVision.Application.Services;

public class Tripo3dService : ITripo3dService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITripoClient _tripoClient;
    private readonly IQuotaService _quotaService;
    private readonly ILogger<Tripo3dService> _logger;

    public Tripo3dService(
        IUnitOfWork unitOfWork,
        ITripoClient tripoClient,
        IQuotaService quotaService,
        ILogger<Tripo3dService> logger)
    {
        _unitOfWork = unitOfWork;
        _tripoClient = tripoClient;
        _quotaService = quotaService;
        _logger = logger;
    }

    public async Task<Ai3dTaskStatusDto> CreateImageTaskAsync(Guid userId, CreateImageTo3dRequestDto request, CancellationToken ct = default)
    {
        // 1. Idempotency Check
        var existingTask = await _unitOfWork.Ai3dRequests.GetByIdempotencyKeyAsync(request.IdempotencyKey);
        if (existingTask != null) return MapToDto(existingTask);

        // 2. IDOR & SSRF Validation
        var fileRecord = await _unitOfWork.UploadedFiles.GetByIdAsync(request.UploadedFileId);
        if (fileRecord == null || fileRecord.UserId != userId) 
            throw new Exception("Không tìm thấy ảnh hoặc bạn không có quyền truy cập ảnh này.");
            
        if (!fileRecord.FileUrl.Contains("res.cloudinary.com")) 
            throw new Exception("Nguồn ảnh không được phép (SSRF Protection).");

        // 3. Transaction
        await _unitOfWork.BeginTransactionAsync(ct);
        try 
        {
            // 3.1. Trừ tiền (Tạm tính)
            int cost = 50; // default cost
            await _quotaService.DeductCreditAsync(userId, cost, ct);

            // 3.2. Lưu DB trạng thái ban đầu
            var newTask = new Ai3dRequest {
                UserId = userId,
                TaskType = "ImageTo3D",
                Status = "queued",
                IdempotencyKey = request.IdempotencyKey,
                CreditCost = cost,
                UploadedFileId = request.UploadedFileId,
                ModelVersion = "v2.5-20250123"
            };
            await _unitOfWork.Ai3dRequests.AddAsync(newTask);
            await _unitOfWork.SaveChangesAsync(ct);

            // 3.3. Gọi API Tripo
            var tripoResponse = await _tripoClient.CreateImageToModelTaskAsync(fileRecord.FileUrl, ct);

            if (tripoResponse.IsSuccess && tripoResponse.TaskId != null) 
            {
                newTask.TripoTaskId = tripoResponse.TaskId;
            } 
            else 
            {
                // Khởi tạo thất bại -> Trả lại tiền và đánh dấu Failed
                newTask.Status = "failed";
                newTask.ErrorMessage = tripoResponse.ErrorMsg ?? "Lỗi kết nối AI Provider";
                await _quotaService.RefundCreditAsync(userId, cost, ct);
            }

            await _unitOfWork.SaveChangesAsync(ct);
            await _unitOfWork.CommitTransactionAsync(ct);

            return MapToDto(newTask);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(ct);
            _logger.LogError(ex, "Lỗi Transaction khi tạo 3D Task");
            throw new Exception("Lỗi hệ thống khi khởi tạo tác vụ.");
        }
    }

    private Ai3dTaskStatusDto MapToDto(Ai3dRequest entity)
    {
        return new Ai3dTaskStatusDto
        {
            Id = entity.Id,
            Status = entity.Status,
            TripoTaskId = entity.TripoTaskId,
            ResultModelUrl = entity.ResultModelUrl,
            Progress = entity.Progress,
            ErrorMessage = entity.ErrorMessage
        };
    }
}
