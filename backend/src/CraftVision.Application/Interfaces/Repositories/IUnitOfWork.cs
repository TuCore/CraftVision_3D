namespace CraftVision.Application.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IKnowledgeMaterialRepository KnowledgeMaterials { get; }
    IKnowledgeTutorialRepository KnowledgeTutorials { get; }
    IAiChatSessionRepository AiChatSessions { get; }
    IAiChatMessageRepository AiChatMessages { get; }
    IAi3dRequestRepository Ai3dRequests { get; }
    IUploadedFileRepository UploadedFiles { get; }

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
