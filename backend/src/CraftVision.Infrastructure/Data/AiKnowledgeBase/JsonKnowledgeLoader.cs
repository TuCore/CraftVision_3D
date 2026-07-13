using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting.Knowledge;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace CraftVision.Infrastructure.Data.AiKnowledgeBase;

public class JsonKnowledgeLoader : IJsonKnowledgeLoader
{
    private readonly ILogger<JsonKnowledgeLoader> _logger;
    private readonly string _basePath;

    public Dictionary<string, ToneRule> Tones { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, OccasionConstraint> Occasions { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, RecipientTrait> Recipients { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, MessageLength> Lengths { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, GiftType> Gifts { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, VisualStyle> Themes { get; private set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<AntiPattern> AntiPatterns { get; private set; } = new();
    public List<CreativityRule> CreativityRules { get; private set; } = new();
    public List<PromptExample> Examples { get; private set; } = new();

    public JsonKnowledgeLoader(ILogger<JsonKnowledgeLoader> logger)
    {
        _logger = logger;
        // Adjust the base path as needed to locate the AiKnowledgeBase folder
        _basePath = Path.Combine(AppContext.BaseDirectory, "Data", "AiKnowledgeBase");
        
        // We can load them immediately if we want to fail fast on startup
        LoadAll();
    }

    public void LoadAll()
    {
        try
        {
            _logger.LogInformation("Loading AI Knowledge Base from {BasePath}", _basePath);
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var toneList = LoadList<ToneRule>("tone_rules.json", options);
            if (toneList != null) Tones = toneList.ToDictionary(x => x.Slug, x => x, StringComparer.OrdinalIgnoreCase);

            var occList = LoadList<OccasionConstraint>("occasion_constraints.json", options);
            if (occList != null) Occasions = occList.ToDictionary(x => x.CategorySlug, x => x, StringComparer.OrdinalIgnoreCase);

            var recList = LoadList<RecipientTrait>("recipient_traits.json", options);
            if (recList != null) Recipients = recList.ToDictionary(x => x.Slug, x => x, StringComparer.OrdinalIgnoreCase);

            var lenList = LoadList<MessageLength>("message_length.json", options);
            if (lenList != null) Lengths = lenList.ToDictionary(x => x.Slug, x => x, StringComparer.OrdinalIgnoreCase);

            var giftList = LoadList<GiftType>("gift_types.json", options);
            if (giftList != null) Gifts = giftList.ToDictionary(x => x.Slug, x => x, StringComparer.OrdinalIgnoreCase);

            var themeList = LoadList<VisualStyle>("visual_style_rules.json", options);
            if (themeList != null) Themes = themeList.ToDictionary(x => x.Theme, x => x, StringComparer.OrdinalIgnoreCase);

            AntiPatterns = LoadList<AntiPattern>("anti_patterns.json", options) ?? new();
            CreativityRules = LoadList<CreativityRule>("creativity_rules.json", options) ?? new();
            Examples = LoadList<PromptExample>("examples.json", options) ?? new();

            _logger.LogInformation("Successfully loaded AI Knowledge Base.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load AI Knowledge Base JSON files.");
        }
    }

    private List<T>? LoadList<T>(string filename, JsonSerializerOptions options)
    {
        var path = Path.Combine(_basePath, filename);
        if (!File.Exists(path))
        {
            _logger.LogWarning("Knowledge base file not found: {Path}", path);
            return new List<T>();
        }

        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<List<T>>(json, options);
    }
}
