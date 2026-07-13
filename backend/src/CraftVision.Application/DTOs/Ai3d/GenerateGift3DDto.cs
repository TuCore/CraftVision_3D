using System;
using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Ai3d;

public class GenerateGift3DDto
{
    public Guid ProductId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public List<Guid>? ReferenceFileIds { get; set; }
}
