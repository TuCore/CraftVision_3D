using System;

namespace CraftVision.Application.DTOs.Upload;

public class UploadResultDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
}
