using CraftVision.Application.Models.AiGreeting.Knowledge;
using System.Collections.Generic;

namespace CraftVision.Application.Interfaces.AiGreeting;

public interface IJsonKnowledgeLoader
{
    Dictionary<string, ToneRule> Tones { get; }
    Dictionary<string, OccasionConstraint> Occasions { get; }
    Dictionary<string, RecipientTrait> Recipients { get; }
    Dictionary<string, MessageLength> Lengths { get; }
    Dictionary<string, GiftType> Gifts { get; }
    Dictionary<string, VisualStyle> Themes { get; }
    List<AntiPattern> AntiPatterns { get; }
    List<CreativityRule> CreativityRules { get; }
    List<PromptExample> Examples { get; }
}
