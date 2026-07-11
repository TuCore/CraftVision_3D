using CraftVision.Application.Common.Diagnostics.Models;

namespace CraftVision.Application.Common.Diagnostics
{
    public interface IAiProfiler
    {
        void Log(AiChatProfile profile);
    }
}
