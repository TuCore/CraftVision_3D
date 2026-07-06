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

        // Indexes
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        
        // HNSW Vector Indexes for similarity search
        modelBuilder.Entity<KnowledgeMaterial>()
            .Property(m => m.Embedding)
            .HasColumnType("vector(1536)");

        modelBuilder.Entity<KnowledgeMaterial>()
            .HasIndex(m => m.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");

        modelBuilder.Entity<KnowledgeTutorial>()
            .Property(t => t.Embedding)
            .HasColumnType("vector(1536)");

        modelBuilder.Entity<KnowledgeTutorial>()
            .HasIndex(t => t.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");

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
    }
}
