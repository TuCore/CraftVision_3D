using System;

namespace CraftVision.Application.DTOs.Ai3d;

public class CreateImageTo3dRequestDto
{
    public Guid UploadedFileId { get; set; }
    public string IdempotencyKey { get; set; } = null!;
}
