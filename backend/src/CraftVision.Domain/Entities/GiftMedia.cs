using System;
using CraftVision.Domain.Enums;

namespace CraftVision.Domain.Entities;

public class GiftMedia
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GiftId { get; set; }
    public Guid FileId { get; set; }
    public MediaType MediaType { get; set; }
    public int DisplayOrder { get; set; }
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Gift? Gift { get; set; }
    public UploadedFile? File { get; set; }
}
