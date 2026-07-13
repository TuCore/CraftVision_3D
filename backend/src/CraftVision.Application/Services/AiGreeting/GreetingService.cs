using CraftVision.Application.DTOs.AiGreeting;
using CraftVision.Application.Interfaces.AiGreeting;
using CraftVision.Application.Models.AiGreeting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace CraftVision.Application.Services.AiGreeting;

public interface IGreetingService
{
    Task<GreetingResponseDto> GenerateGreetingAsync(GreetingRequestDto request);
}

public class GreetingService : IGreetingService
{
    private readonly IGreetingRequestValidator _validator;
    private readonly IPromptContextProvider _contextProvider;
    private readonly IRuleConflictEngine _conflictEngine;
    private readonly IPromptPipeline _pipeline;
    private readonly IMasterPromptBuilder _promptBuilder;
    private readonly ILLMProvider _llmProvider;
    private readonly IOutputValidator _outputValidator;
    private readonly IPostProcessor _postProcessor;
    private readonly AiModelOptions _modelOptions;
    private readonly ILogger<GreetingService> _logger;

    public GreetingService(
        IGreetingRequestValidator validator,
        IPromptContextProvider contextProvider,
        IRuleConflictEngine conflictEngine,
        IPromptPipeline pipeline,
        IMasterPromptBuilder promptBuilder,
        ILLMProvider llmProvider,
        IOutputValidator outputValidator,
        IPostProcessor postProcessor,
        IOptions<AiModelOptions> modelOptions,
        ILogger<GreetingService> logger)
    {
        _validator = validator;
        _contextProvider = contextProvider;
        _conflictEngine = conflictEngine;
        _pipeline = pipeline;
        _promptBuilder = promptBuilder;
        _llmProvider = llmProvider;
        _outputValidator = outputValidator;
        _postProcessor = postProcessor;
        _modelOptions = modelOptions.Value;
        _logger = logger;
    }

    public async Task<GreetingResponseDto> GenerateGreetingAsync(GreetingRequestDto request)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();

        // 1. Validate
        if (!_validator.Validate(request, out var error))
        {
            throw new System.ArgumentException(error);
        }

        // 2. Load Context (cached)
        var context = _contextProvider.GetContext(request);

        // 3. Resolve Conflicts
        context = _conflictEngine.ResolveConflicts(context);

        // 4. Process Pipeline
        context = _pipeline.Process(context);

        // 5. Build Prompt
        var messages = _promptBuilder.Build(context);

        // 6. Call LLM & Validate Output (Max 2 retries)
        string rawOutput = string.Empty;
        int retries = 0;
        bool isValid = false;

        while (retries < 2 && !isValid)
        {
            rawOutput = await _llmProvider.GenerateResponseAsync(messages);
            isValid = _outputValidator.IsValid(rawOutput, context);

            if (!isValid)
            {
                _logger.LogWarning("LLM Output Validation failed. Retrying... Attempt {Attempt}", retries + 1);
                retries++;
            }
        }

        if (!isValid)
        {
            _logger.LogError("Failed to generate a valid greeting after retries.");
            // We can choose to return the raw anyway or throw. Let's return raw as fallback.
        }

        // 7. Post Process
        var response = _postProcessor.Process(rawOutput, context, _modelOptions);
        
        watch.Stop();
        response.Metadata.GenerationTimeMs = watch.ElapsedMilliseconds;

        _logger.LogInformation("Greeting generated in {Time}ms. Quality: {Score} ({Label})", 
            response.Metadata.GenerationTimeMs, response.Metadata.QualityScore, response.Metadata.QualityLabel);

        return response;
    }
}
