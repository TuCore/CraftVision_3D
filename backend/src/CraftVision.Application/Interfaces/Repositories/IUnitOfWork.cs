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
    IProductCategoryRepository ProductCategories { get; }
    IGiftCategoryRepository GiftCategories { get; }
    IProductRepository Products { get; }
    IProductImageRepository ProductImages { get; }
    IOrderRepository Orders { get; }
    IOrderItemRepository OrderItems { get; }
    INfcTagRepository NfcTags { get; }
    IGiftRepository Gifts { get; }
    IGiftMediaRepository GiftMediaList { get; }
    IGiftAiProfileRepository GiftAiProfiles { get; }
    IScanHistoryRepository ScanHistories { get; }
    IMessageTemplateRepository MessageTemplates { get; }

    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
