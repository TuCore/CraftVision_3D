using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;
using CraftVision.Application.Interfaces;

namespace CraftVision.Application.Services;

public class AiService : IAiService
{
    public Task<string> GenerateMessageAsync(GenerateGiftMessageDto dto)
    {
        // Mock implementation
        return Task.FromResult("Chúc bạn một ngày thật vui vẻ và hạnh phúc!");
    }

    public Task<Ai3dTaskStatusDto> Generate3DModelAsync(Guid userId, GenerateGift3DDto dto)
    {
        // Mock implementation for AI task creation
        return Task.FromResult(new Ai3dTaskStatusDto
        {
            TaskId = Guid.NewGuid(),
            Status = "Queued",
            Progress = 0,
            CreatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        });
    }

    public Task<Ai3dTaskStatusDto> Get3DTaskStatusAsync(Guid userId, Guid taskId)
    {
        // Mock implementation for AI task status polling
        return Task.FromResult(new Ai3dTaskStatusDto
        {
            TaskId = taskId,
            Status = "Success",
            Progress = 100,
            ModelUrl = "https://example.com/models/sample.glb",
            PreviewImageUrl = "https://example.com/images/sample.png",
            CreatedAt = DateTime.UtcNow.AddMinutes(-5),
            CompletedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddDays(1)
        });
    }
}
