using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Infrastructure.Data;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IWebVoucherService? _vouchers;
    
    public IUserRepository Users { get; }
    public IKnowledgeMaterialRepository KnowledgeMaterials { get; }
    public IKnowledgeTutorialRepository KnowledgeTutorials { get; }
    public IAiChatSessionRepository AiChatSessions { get; }
    public IAiChatMessageRepository AiChatMessages { get; }
    public IAi3dRequestRepository Ai3dRequests { get; }
    public IUploadedFileRepository UploadedFiles { get; }
    public IProductCategoryRepository ProductCategories { get; }
    public IGiftCategoryRepository GiftCategories { get; }
    public IProductRepository Products { get; }
    public IProductImageRepository ProductImages { get; }
    public IOrderRepository Orders { get; }
    public IOrderItemRepository OrderItems { get; }
    public INfcTagRepository NfcTags { get; }
    public IGiftRepository Gifts { get; }
    public IGiftMediaRepository GiftMediaList { get; }
    public IGiftAiProfileRepository GiftAiProfiles { get; }
    public IScanHistoryRepository ScanHistories { get; }
    public IMessageTemplateRepository MessageTemplates { get; }
    public IReviewRepository Reviews { get; }

    public UnitOfWork(
        ApplicationDbContext dbContext,
        IUserRepository userRepository,
        IKnowledgeMaterialRepository knowledgeMaterialRepository,
        IKnowledgeTutorialRepository knowledgeTutorialRepository,
        IAiChatSessionRepository aiChatSessionRepository,
        IAiChatMessageRepository aiChatMessageRepository,
        IAi3dRequestRepository ai3dRequestRepository,
        IUploadedFileRepository uploadedFileRepository,
        IProductCategoryRepository productCategoryRepository,
        IGiftCategoryRepository giftCategoryRepository,
        IProductRepository productRepository,
        IProductImageRepository productImageRepository,
        IOrderRepository orderRepository,
        IOrderItemRepository orderItemRepository,
        INfcTagRepository nfcTagRepository,
        IGiftRepository giftRepository,
        IGiftMediaRepository giftMediaRepository,
        IGiftAiProfileRepository giftAiProfileRepository,
        IScanHistoryRepository scanHistoryRepository,
        IMessageTemplateRepository messageTemplateRepository,
        IReviewRepository reviewRepository,
        IWebVoucherService? vouchers = null)
    {
        _dbContext = dbContext;
        _vouchers = vouchers;
        Users = userRepository;
        KnowledgeMaterials = knowledgeMaterialRepository;
        KnowledgeTutorials = knowledgeTutorialRepository;
        AiChatSessions = aiChatSessionRepository;
        AiChatMessages = aiChatMessageRepository;
        Ai3dRequests = ai3dRequestRepository;
        UploadedFiles = uploadedFileRepository;
        ProductCategories = productCategoryRepository;
        GiftCategories = giftCategoryRepository;
        Products = productRepository;
        ProductImages = productImageRepository;
        Orders = orderRepository;
        OrderItems = orderItemRepository;
        NfcTags = nfcTagRepository;
        Gifts = giftRepository;
        GiftMediaList = giftMediaRepository;
        GiftAiProfiles = giftAiProfileRepository;
        ScanHistories = scanHistoryRepository;
        MessageTemplates = messageTemplateRepository;
        Reviews = reviewRepository;
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
        var orders = _dbContext.ChangeTracker.Entries<Order>()
            .Where(e => e.State == EntityState.Modified && e.Entity.VoucherCode != null).Select(e => e.Entity).ToList();
        if (_vouchers is null || orders.Count == 0) return await _dbContext.SaveChangesAsync(cancellationToken);
        var ownsTransaction = _dbContext.Database.CurrentTransaction is null;
        await using var tx = ownsTransaction ? await _dbContext.Database.BeginTransactionAsync(cancellationToken) : null;
        foreach (var order in orders) await _vouchers.SynchronizeAsync(order, cancellationToken);
        var result = await _dbContext.SaveChangesAsync(cancellationToken);
        if (tx is not null) await tx.CommitAsync(cancellationToken);
        return result;
    }

    public void Dispose()
    {
        _dbContext.Dispose();
    }
}
