using System;
using System.Threading;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Ai3d;

namespace CraftVision.Application.Interfaces;

public interface ITripo3dService
{
    Task<Ai3dTaskStatusDto> CreateImageTaskAsync(Guid userId, CreateImageTo3dRequestDto request, CancellationToken ct = default);
}
