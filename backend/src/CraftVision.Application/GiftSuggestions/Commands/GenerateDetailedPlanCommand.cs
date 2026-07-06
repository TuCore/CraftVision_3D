using CraftVision.Application.GiftSuggestions.Dtos;
using CraftVision.Application.Interfaces.AI;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Domain.Entities;
using MediatR;
using System.Text;

namespace CraftVision.Application.GiftSuggestions.Commands
{
    public class GenerateDetailedPlanCommand : IRequest<DiyPlanDto>
    {
        public Guid UserId { get; set; }
        public Guid SuggestionId { get; set; }
        
        // To rebuild context, we might need the original intent. 
        // In a real app, SuggestionId would link back to the AiRequest which holds the ParsedIntent.
        public string? OriginalIntent { get; set; }
    }

    public class GenerateDetailedPlanCommandHandler : IRequestHandler<GenerateDetailedPlanCommand, DiyPlanDto>
    {
        private readonly IEmbeddingService _embeddingService;
        private readonly IKnowledgeRepository _knowledgeRepository;
        private readonly IAiPlanGenerator _planGenerator;

        public GenerateDetailedPlanCommandHandler(
            IEmbeddingService embeddingService,
            IKnowledgeRepository knowledgeRepository,
            IAiPlanGenerator planGenerator)
        {
            _embeddingService = embeddingService;
            _knowledgeRepository = knowledgeRepository;
            _planGenerator = planGenerator;
        }

        public async Task<DiyPlanDto> Handle(GenerateDetailedPlanCommand request, CancellationToken cancellationToken)
        {
            // 1. Quota Check (TODO: check quota here)

            // 2. Fetch Suggestion (Mocking it here since we don't have a repository for GiftSuggestion yet)
            var chosenSuggestion = new GiftSuggestion 
            { 
                Id = request.SuggestionId, 
                Name = "Mocked Suggestion",
                Difficulty = Domain.Enums.Difficulty.Medium
            };

            // 3. Generate Embedding to find specific tutorials for this suggestion
            var vector = await _embeddingService.GenerateEmbeddingAsync(chosenSuggestion.Name);

            // 4. Retrieve Tutorials & Materials
            var tutorials = await _knowledgeRepository.SearchSimilarTutorialsAsync(vector, topK: 3);

            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("Tutorials Found:");
            foreach (var t in tutorials)
            {
                contextBuilder.AppendLine($"- {t.Title} (Video: {t.VideoUrl})");
            }

            // 5. Generate Detailed Plan via LLM
            var plan = await _planGenerator.GenerateDetailedPlanAsync(request.OriginalIntent ?? "", chosenSuggestion, contextBuilder.ToString());

            // 6. Map to DTO and return
            return new DiyPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                Occasion = plan.Occasion,
                Difficulty = plan.Difficulty,
                EstimatedMinutes = plan.EstimatedMinutes,
                EstimatedCost = plan.EstimatedCost,
                MaterialsJson = plan.MaterialsJson,
                StepsJson = plan.StepsJson,
                ShareSlug = plan.ShareSlug
            };
        }
    }
}
