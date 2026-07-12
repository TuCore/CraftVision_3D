using System.Collections.Generic;

namespace CraftVision.Application.DTOs.NfcTag;

public class ImportNfcTagDto
{
    public List<string> TagCodes { get; set; } = new();
}
