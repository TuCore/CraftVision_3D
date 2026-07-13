using System.Collections.Generic;

namespace CraftVision.Application.Models.AiGreeting;

public class PromptContext
{
    public string ToneRules { get; set; } = string.Empty;
    public string OccasionRules { get; set; } = string.Empty;
    public string RecipientRules { get; set; } = string.Empty;
    public string LengthRules { get; set; } = string.Empty;
    public string GiftRules { get; set; } = string.Empty;
    public string ThemeRules { get; set; } = string.Empty;
    public string CreativityRules { get; set; } = string.Empty;
    public string AntiPatterns { get; set; } = string.Empty;
    public List<string> Examples { get; set; } = new List<string>();

    public string SenderName { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
    public string SpecialMemory { get; set; } = string.Empty;
    public string ExtraDetails { get; set; } = string.Empty;
    
    public int MaxWords { get; set; } = 50;
}
