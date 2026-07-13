using CraftVision.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace CraftVision.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserQuota> UserQuotas { get; set; } = null!;
    public DbSet<UploadedFile> UploadedFiles { get; set; } = null!;
    public DbSet<ImageAnalysisResult> ImageAnalysisResults { get; set; } = null!;
    public DbSet<AiChatSession> AiChatSessions { get; set; } = null!;
    public DbSet<AiRequest> AiRequests { get; set; } = null!;
    public DbSet<AiChatMessage> AiChatMessages { get; set; } = null!;
    public DbSet<KnowledgeMaterial> KnowledgeMaterials { get; set; } = null!;
    public DbSet<KnowledgeTutorial> KnowledgeTutorials { get; set; } = null!;
    public DbSet<GiftSuggestion> GiftSuggestions { get; set; } = null!;
    public DbSet<DiyPlan> DiyPlans { get; set; } = null!;
    public DbSet<DiyPlanMaterial> DiyPlanMaterials { get; set; } = null!;
    public DbSet<DiyPlanTutorial> DiyPlanTutorials { get; set; } = null!;
    public DbSet<Ai3dRequest> Ai3dRequests { get; set; } = null!;
    public DbSet<ProductCategory> ProductCategories { get; set; } = null!;
    public DbSet<GiftCategory> GiftCategories { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<ProductImage> ProductImages { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<NfcTag> NfcTags { get; set; } = null!;
    public DbSet<Gift> Gifts { get; set; } = null!;
    public DbSet<GiftMedia> GiftMediaList { get; set; } = null!;
    public DbSet<GiftAiProfile> GiftAiProfiles { get; set; } = null!;
    public DbSet<ScanHistory> ScanHistories { get; set; } = null!;
    public DbSet<MessageTemplate> MessageTemplates { get; set; } = null!;
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Đăng ký extension vector cho RAG
        modelBuilder.HasPostgresExtension("vector");
        // Đăng ký pgcrypto để dùng gen_random_uuid()
        modelBuilder.HasPostgresExtension("pgcrypto");

        // Table Mappings
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<UserQuota>().ToTable("user_quotas");
        modelBuilder.Entity<UploadedFile>().ToTable("uploaded_files");
        modelBuilder.Entity<ImageAnalysisResult>().ToTable("image_analysis_results");
        modelBuilder.Entity<AiChatSession>().ToTable("ai_chat_sessions");
        modelBuilder.Entity<AiRequest>().ToTable("ai_requests");
        modelBuilder.Entity<AiChatMessage>().ToTable("ai_chat_messages");
        modelBuilder.Entity<KnowledgeMaterial>().ToTable("knowledge_materials");
        modelBuilder.Entity<KnowledgeTutorial>().ToTable("knowledge_tutorials");
        modelBuilder.Entity<GiftSuggestion>().ToTable("gift_suggestions");
        modelBuilder.Entity<DiyPlan>().ToTable("diy_plans");
        modelBuilder.Entity<DiyPlanMaterial>().ToTable("diy_plan_materials");
        modelBuilder.Entity<DiyPlanTutorial>().ToTable("diy_plan_tutorials");
        modelBuilder.Entity<Ai3dRequest>().ToTable("ai_3d_requests");
        modelBuilder.Entity<ProductCategory>().ToTable("product_categories");
        modelBuilder.Entity<GiftCategory>().ToTable("gift_categories");
        modelBuilder.Entity<Product>().ToTable("products");
        modelBuilder.Entity<ProductImage>().ToTable("product_images");
        modelBuilder.Entity<Order>().ToTable("orders");
        modelBuilder.Entity<OrderItem>().ToTable("order_items");
        modelBuilder.Entity<NfcTag>().ToTable("nfc_tags");
        modelBuilder.Entity<Gift>().ToTable("gifts");
        modelBuilder.Entity<GiftMedia>().ToTable("gift_media");
        modelBuilder.Entity<GiftAiProfile>().ToTable("gift_ai_profiles");
        modelBuilder.Entity<ScanHistory>().ToTable("scan_histories");
        modelBuilder.Entity<MessageTemplate>().ToTable("message_templates");

        // Soft delete global query filters
        modelBuilder.Entity<ProductCategory>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<GiftCategory>().HasQueryFilter(e => e.IsActive);
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.IsActive);

        // Optimistic Concurrency — RowVersion with default value for PostgreSQL
        modelBuilder.Entity<Product>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .HasDefaultValue(new byte[] { 0 });

        // Enums (EF Core maps enums to integer by default, can configure conversion if string is needed, but we keep default int/smallint)

        // Indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        
        // HNSW Vector Indexes for similarity search
        modelBuilder.Entity<KnowledgeMaterial>()
            .Property(m => m.Embedding)
            .HasColumnType("vector(768)");
            
        modelBuilder.Entity<KnowledgeMaterial>()
            .HasIndex(m => m.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");

        modelBuilder.Entity<KnowledgeTutorial>()
            .Property(t => t.Embedding)
            .HasColumnType("vector(768)");

        modelBuilder.Entity<KnowledgeTutorial>()
            .HasIndex(t => t.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");

        // Ai3dRequest Indexes
        modelBuilder.Entity<Ai3dRequest>().HasIndex(x => x.TripoTaskId).IsUnique();
        modelBuilder.Entity<Ai3dRequest>().HasIndex(x => x.IdempotencyKey).IsUnique();
        modelBuilder.Entity<Ai3dRequest>()
            .HasIndex(x => new { x.Status, x.LockedUntil })
            .HasFilter("status IN ('queued', 'running')");

        // JSONB Columns mapping
        modelBuilder.Entity<AiRequest>().Property(r => r.ParsedIntent).HasColumnType("jsonb");
        modelBuilder.Entity<DiyPlan>().Property(p => p.MaterialsJson).HasColumnType("jsonb");
        modelBuilder.Entity<DiyPlan>().Property(p => p.StepsJson).HasColumnType("jsonb");

        // Explicit Relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Quota)
            .WithOne(q => q.User)
            .HasForeignKey<UserQuota>(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UploadedFile>()
            .HasOne(f => f.ImageAnalysisResult)
            .WithOne(r => r.UploadedFile)
            .HasForeignKey<ImageAnalysisResult>(r => r.UploadedFileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AiRequest>()
            .HasOne(r => r.DiyPlan)
            .WithOne(p => p.Request)
            .HasForeignKey<DiyPlan>(p => p.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AiRequest>()
            .HasMany(r => r.Suggestions)
            .WithOne(s => s.Request)
            .HasForeignKey(s => s.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.ProductCategory)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.ProductCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductImage>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.ProductImages)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.OrderItems)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Gift>()
            .HasOne(g => g.OrderItem)
            .WithOne(oi => oi.Gift)
            .HasForeignKey<Gift>(g => g.OrderItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Gift>()
            .HasOne(g => g.NfcTag)
            .WithOne(n => n.Gift)
            .HasForeignKey<Gift>(g => g.NfcTagId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GiftAiProfile>()
            .HasOne(gap => gap.Gift)
            .WithOne(g => g.AiProfile)
            .HasForeignKey<GiftAiProfile>(gap => gap.GiftId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GiftMedia>()
            .HasOne(gm => gm.Gift)
            .WithMany(g => g.MediaList)
            .HasForeignKey(gm => gm.GiftId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScanHistory>()
            .HasOne(sh => sh.Gift)
            .WithMany(g => g.ScanHistories)
            .HasForeignKey(sh => sh.GiftId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed Admin User
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Email = "admin@craftvision.vn",
            FullName = "Admin",
            Role = CraftVision.Domain.Enums.UserRole.Admin,
            PasswordHash = "$2a$11$fbsBU9IgXg5Uz9ROjmJC.ewxbazje/LgbxGyUEguwKqg1InK6wHjO", // "admin" hashed with BCrypt
            Tier = CraftVision.Domain.Enums.UserTier.Premium,
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed mock NFC tags
        modelBuilder.Entity<NfcTag>().HasData(
            new NfcTag { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), TagCode = "NFC000001", Status = CraftVision.Domain.Enums.NfcStatus.Active, SecretKey = "abc", ScanCount = 15, LastScanAt = new DateTime(2026, 7, 13, 10, 0, 0, DateTimeKind.Utc), LinkedUrl = "https://craftvision.vn/nfc/abcxyz", CreatedAt = new DateTime(2026, 7, 10, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 7, 13, 10, 0, 0, DateTimeKind.Utc) },
            new NfcTag { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), TagCode = "NFC000002", Status = CraftVision.Domain.Enums.NfcStatus.Available, SecretKey = "def", ScanCount = 0, CreatedAt = new DateTime(2026, 7, 11, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 7, 11, 0, 0, 0, DateTimeKind.Utc) },
            new NfcTag { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), TagCode = "NFC000003", Status = CraftVision.Domain.Enums.NfcStatus.Disabled, SecretKey = "ghi", ScanCount = 3, LastScanAt = new DateTime(2026, 7, 12, 10, 0, 0, DateTimeKind.Utc), LinkedUrl = "https://craftvision.vn/nfc/xyz123", CreatedAt = new DateTime(2026, 7, 10, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 7, 12, 10, 0, 0, DateTimeKind.Utc) }
        );
    }
}
