using System.Collections.Generic;

namespace CraftVision.Application.Models.AiGreeting.Knowledge;

public class ToneRule
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Rules { get; set; } = string.Empty;
    public List<string> ForbiddenTones { get; set; } = new();
    public int Priority { get; set; }
}

public class OccasionConstraint
{
    public int Id { get; set; }
    public string CategorySlug { get; set; } = string.Empty;
    public string Occasion { get; set; } = string.Empty;
    public string Dos { get; set; } = string.Empty;
    public string Donts { get; set; } = string.Empty;
    public int Priority { get; set; }
}

public class RecipientTrait
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Preferences { get; set; } = string.Empty;
    public List<string> RecommendedStyles { get; set; } = new();
    public int Priority { get; set; }
}

public class MessageLength
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int MaxWords { get; set; }
    public string FormatHint { get; set; } = string.Empty;
}

public class GiftType
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VisualElement { get; set; } = string.Empty;
}

public class VisualStyle
{
    public int Id { get; set; }
    public string Theme { get; set; } = string.Empty;
    public string Style3D { get; set; } = string.Empty;
    public string Lighting { get; set; } = string.Empty;
    public string Materials { get; set; } = string.Empty;
    public string CameraAngle { get; set; } = string.Empty;
}

public class AntiPattern
{
    public int Id { get; set; }
    public string Pattern { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Suggestion { get; set; } = string.Empty;
}

public class CreativityRule
{
    public int Id { get; set; }
    public string Rule { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class PromptExample
{
    public int Id { get; set; }
    public string Occasion { get; set; } = string.Empty;
    public string Tone { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string Input { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
}
