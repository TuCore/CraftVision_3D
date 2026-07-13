using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;

namespace CraftVision.Application.Services.AiGreeting;

public class RuleConflictEngine : IRuleConflictEngine
{
    public PromptContext ResolveConflicts(PromptContext context)
    {
        // Basic implementation: we can add advanced priority conflict logic here.
        // For MVP, we just ensure that if Teacher is present, we enforce formal rules.
        if (context.OccasionRules.Contains("Nhà Giáo"))
        {
            context.ToneRules = "Tone (Trang trọng): Sử dụng các từ hán việt mang tính tri ân, kính chúc. Câu cú đầy đủ chủ vị. Kính gửi Quý Thầy Cô.";
        }

        return context;
    }
}
