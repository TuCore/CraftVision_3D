using System;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;

namespace CraftVision.Application.Interfaces;

public interface IAiService
{
    Task<string> GenerateMessageAsync(GenerateGiftMessageDto dto);
    Task<Ai3dTaskStatusDto> Generate3DModelAsync(Guid userId, GenerateGift3DDto dto);
    Task<Ai3dTaskStatusDto> Get3DTaskStatusAsync(Guid userId, Guid taskId);
}
