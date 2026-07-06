using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Infrastructure.Data;

namespace CraftVision.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _dbContext;
    
    public IUserRepository Users { get; }
    public IKnowledgeMaterialRepository KnowledgeMaterials { get; }
    public IKnowledgeTutorialRepository KnowledgeTutorials { get; }
    public IAiChatSessionRepository AiChatSessions { get; }
    public IAiChatMessageRepository AiChatMessages { get; }

    public UnitOfWork(
        ApplicationDbContext dbContext,
        IUserRepository userRepository,
        IKnowledgeMaterialRepository knowledgeMaterialRepository,
        IKnowledgeTutorialRepository knowledgeTutorialRepository,
        IAiChatSessionRepository aiChatSessionRepository,
        IAiChatMessageRepository aiChatMessageRepository)
    {
        _dbContext = dbContext;
        Users = userRepository;
        KnowledgeMaterials = knowledgeMaterialRepository;
        KnowledgeTutorials = knowledgeTutorialRepository;
        AiChatSessions = aiChatSessionRepository;
        AiChatMessages = aiChatMessageRepository;
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.CommitTransactionAsync(cancellationToken);
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.RollbackTransactionAsync(cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
