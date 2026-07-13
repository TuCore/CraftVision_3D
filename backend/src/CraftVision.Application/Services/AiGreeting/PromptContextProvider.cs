using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;
using Microsoft.Extensions.Caching.Memory;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace CraftVision.Application.Services.AiGreeting;

public class PromptContextProvider : IPromptContextProvider
{
    private readonly IJsonKnowledgeLoader _knowledge;
    private readonly IMemoryCache _cache;

    public PromptContextProvider(IJsonKnowledgeLoader knowledge, IMemoryCache cache)
    {
        _knowledge = knowledge;
        _cache = cache;
    }

    public PromptContext GetContext(GreetingRequestDto request)
    {
        // Compute cache key based on inputs
        var cacheKey = ComputeHash($"{request.Tone}_{request.Occasion}_{request.RecipientTrait}_{request.Length}_{request.GiftType}_{request.VisualStyle}");
        
        if (!_cache.TryGetValue(cacheKey, out PromptContext context))
        {
            context = BuildContext(request);
            // Cache for 1 hour to save processing time for identical requests
            _cache.Set(cacheKey, context, System.TimeSpan.FromHours(1));
        }

        // Clone context to inject User Data (which shouldn't be cached globally across users)
        var userContext = new PromptContext
        {
            ToneRules = context.ToneRules,
            OccasionRules = context.OccasionRules,
            RecipientRules = context.RecipientRules,
            LengthRules = context.LengthRules,
            GiftRules = context.GiftRules,
            ThemeRules = context.ThemeRules,
            AntiPatterns = context.AntiPatterns,
            CreativityRules = context.CreativityRules,
            Examples = context.Examples.ToList(),
            MaxWords = context.MaxWords,
            
            // Inject User specific info
            SenderName = request.SenderName,
            ReceiverName = request.ReceiverName,
            Relationship = request.Relationship,
            SpecialMemory = request.SpecialMemory,
            ExtraDetails = request.ExtraDetails
        };

        return userContext;
    }

    private PromptContext BuildContext(GreetingRequestDto request)
    {
        var context = new PromptContext();

        if (_knowledge.Tones.TryGetValue(request.Tone, out var tone))
        {
            context.ToneRules = $"Tone ({tone.Name}): {tone.Rules}";
        }

        if (_knowledge.Occasions.TryGetValue(request.Occasion, out var occ))
        {
            context.OccasionRules = $"Occasion ({occ.Occasion}): DOs: {occ.Dos} | DONTs: {occ.Donts}";
        }

        if (_knowledge.Recipients.TryGetValue(request.RecipientTrait, out var rec))
        {
            context.RecipientRules = $"Recipient ({rec.Name}): {rec.Preferences}";
        }

        if (_knowledge.Lengths.TryGetValue(request.Length, out var len))
        {
            context.LengthRules = $"Format ({len.Name}): {len.FormatHint}";
            context.MaxWords = len.MaxWords;
        }

        if (_knowledge.Gifts.TryGetValue(request.GiftType, out var gift))
        {
            context.GiftRules = $"Gift ({gift.Name}): {gift.Description} - Visuals: {gift.VisualElement}";
        }

        if (_knowledge.Themes.TryGetValue(request.VisualStyle, out var theme))
        {
            context.ThemeRules = $"Theme ({theme.Theme}): {theme.Style3D}. Light: {theme.Lighting}";
        }

        // Merge Anti-Patterns
        context.AntiPatterns = string.Join(" ", _knowledge.AntiPatterns.Select(x => $"- Avoid: {x.Pattern}. {x.Suggestion}"));

        // Merge Creativity Rules
        context.CreativityRules = string.Join(" ", _knowledge.CreativityRules.Select(x => $"- {x.Rule}: {x.Description}"));

        // Smart Few-Shot Selection
        // Top 2 Occasion, Top 2 Tone, Top 1 Recipient
        var occExamples = _knowledge.Examples.Where(x => x.Occasion == request.Occasion).Take(2);
        var toneExamples = _knowledge.Examples.Where(x => x.Tone == request.Tone && !occExamples.Contains(x)).Take(2);
        var recExamples = _knowledge.Examples.Where(x => x.Recipient == request.RecipientTrait && !occExamples.Contains(x) && !toneExamples.Contains(x)).Take(1);
        
        var selectedExamples = occExamples.Concat(toneExamples).Concat(recExamples).ToList();
        
        // Fallback if not enough specific examples
        if (selectedExamples.Count < 3)
        {
            selectedExamples.AddRange(_knowledge.Examples.Except(selectedExamples).Take(5 - selectedExamples.Count));
        }

        context.Examples = selectedExamples.Select(e => $"Input: {e.Input}\nOutput: {e.Output}").ToList();

        return context;
    }

    private string ComputeHash(string rawData)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        return System.Convert.ToBase64String(bytes);
    }
}
