-- ============================================================================
-- DIY GIFT AI CHATBOT — FULL DATABASE SCHEMA (PostgreSQL)
-- Bao gồm: 7 bảng gốc + 2 bảng RAG (Knowledge Base) + các bảng/field bổ sung
-- Thiết kế cho: .NET Entity Framework Core + Npgsql.EntityFrameworkCore.PostgreSQL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- cho gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector, cho cột EMBEDDING + cosine similarity

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------------------
CREATE TYPE user_tier_enum        AS ENUM ('Free', 'Premium');
CREATE TYPE file_type_enum        AS ENUM ('Image');
CREATE TYPE message_role_enum     AS ENUM ('User', 'Assistant', 'System');
CREATE TYPE request_status_enum   AS ENUM ('Pending', 'Completed', 'Failed');
CREATE TYPE difficulty_enum       AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE option_level_enum     AS ENUM ('Basic', 'Intermediate', 'Advanced');
CREATE TYPE material_unit_enum    AS ENUM ('piece', 'meter', 'gram', 'set', 'pack', 'liter');

-- ----------------------------------------------------------------------------
-- 2. USERS (bảng gốc + bổ sung AuthProvider, ProviderId, IsActive)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),                 -- NULLABLE vì có thể login qua OAuth
    tier            user_tier_enum NOT NULL DEFAULT 'Free',
    auth_provider   VARCHAR(50),                  -- 'Google', 'GitHub', 'Credentials'...
    provider_id     VARCHAR(255),                 -- sub/id từ OAuth provider
    is_active       BOOLEAN NOT NULL DEFAULT TRUE, -- soft delete / khóa tài khoản
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(auth_provider, provider_id);

-- Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. USER_QUOTAS (bảng gốc)
-- ----------------------------------------------------------------------------
CREATE TABLE user_quotas (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    daily_requests_used   INT NOT NULL DEFAULT 0,
    daily_limit           INT NOT NULL DEFAULT 5,   -- Free = 5, Premium = 9999
    last_reset_date       DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ----------------------------------------------------------------------------
-- 4. UPLOADED_FILES (bảng gốc)
-- ----------------------------------------------------------------------------
CREATE TABLE uploaded_files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url    TEXT NOT NULL,      -- link Cloudinary
    file_type   file_type_enum NOT NULL DEFAULT 'Image',
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id);

-- ----------------------------------------------------------------------------
-- 5. IMAGE_ANALYSIS_RESULTS (BẢNG MỚI — lưu kết quả nhận diện ảnh)
-- ----------------------------------------------------------------------------
CREATE TABLE image_analysis_results (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_file_id      UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    detected_materials    JSONB,          -- ["da thuộc", "kim loại", ...]
    detected_colors       JSONB,          -- ["nâu", "vàng đồng", ...]
    detected_technique    VARCHAR(255),   -- VD: "thắt nút Macrame"
    raw_vision_response   JSONB,          -- log nguyên văn response từ Vision API để debug
    confidence_score      DECIMAL(5,2),
    created_at            TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_image_analysis_file ON image_analysis_results(uploaded_file_id);

-- ----------------------------------------------------------------------------
-- 6. AI_CHAT_SESSIONS (bảng gốc)
-- ----------------------------------------------------------------------------
CREATE TABLE ai_chat_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    last_active_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user ON ai_chat_sessions(user_id);

-- ----------------------------------------------------------------------------
-- 7. AI_REQUESTS (bảng gốc + bổ sung ParsedIntent, ErrorMessage)
--    Lưu ý: tạo TRƯỚC ai_chat_messages vì ai_chat_messages sẽ tham chiếu tới nó
-- ----------------------------------------------------------------------------
CREATE TABLE ai_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id          UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    prompt_text         TEXT NOT NULL,
    uploaded_file_id    UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
    parsed_intent       JSONB,      -- {"budget":200000,"occasion":"anniversary","timeLimit":20,"recipient":"girlfriend"}
    request_tokens      INT DEFAULT 0,
    response_tokens     INT DEFAULT 0,
    total_tokens        INT DEFAULT 0,
    status              request_status_enum NOT NULL DEFAULT 'Pending',
    error_message       TEXT,       -- chỉ có giá trị khi status = 'Failed'
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_requests_user ON ai_requests(user_id);
CREATE INDEX idx_ai_requests_session ON ai_requests(session_id);
CREATE INDEX idx_ai_requests_status ON ai_requests(status);

-- ----------------------------------------------------------------------------
-- 8. AI_CHAT_MESSAGES (bảng gốc + bổ sung RetrievedContextIds, RequestId)
-- ----------------------------------------------------------------------------
CREATE TABLE ai_chat_messages (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    request_id              UUID REFERENCES ai_requests(id) ON DELETE SET NULL,
    role                    message_role_enum NOT NULL,
    content                 TEXT NOT NULL,
    image_file_id           UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
    retrieved_context_ids   UUID[] DEFAULT '{}',  -- ID của KnowledgeMaterials/Tutorials được RAG lấy lên
    tokens_used             INT DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON ai_chat_messages(session_id);
CREATE INDEX idx_chat_messages_request ON ai_chat_messages(request_id);

-- ----------------------------------------------------------------------------
-- 9. KNOWLEDGE_MATERIALS (RAG — bổ sung IsActive, LastCheckedAt, Unit)
-- ----------------------------------------------------------------------------
CREATE TABLE knowledge_materials (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,      -- VD: "Dây da sáp 2mm"
    category          VARCHAR(100),               -- VD: "Da thuộc", "Len", "Resin"
    current_price     DECIMAL(10,2) NOT NULL,
    unit              material_unit_enum NOT NULL DEFAULT 'piece',
    purchase_url      TEXT NOT NULL,               -- link Shopee/Tiki/Lazada
    image_url         TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE, -- link/hàng còn tồn tại không
    last_checked_at   TIMESTAMP,                    -- lần cuối cron job kiểm tra link/giá
    embedding         VECTOR(1536),                 -- vector nhúng ngữ nghĩa
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_materials_category ON knowledge_materials(category);
CREATE INDEX idx_knowledge_materials_active ON knowledge_materials(is_active);
-- HNSW index cho cosine similarity search (pgvector >= 0.5.0)
CREATE INDEX idx_knowledge_materials_embedding
    ON knowledge_materials USING hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- 10. KNOWLEDGE_TUTORIALS (RAG)
-- ----------------------------------------------------------------------------
CREATE TABLE knowledge_tutorials (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,   -- VD: "Hướng dẫn thắt vòng tay da basic"
    video_url           TEXT NOT NULL,           -- link YouTube/TikTok
    difficulty          difficulty_enum NOT NULL DEFAULT 'Easy',
    estimated_minutes   INT NOT NULL,
    embedding           VECTOR(1536),
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_tutorials_difficulty ON knowledge_tutorials(difficulty);
CREATE INDEX idx_knowledge_tutorials_embedding
    ON knowledge_tutorials USING hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- 11. DIY_PLANS (bảng gốc + bổ sung ShareSlug, IsPublic, Difficulty,
--     EstimatedMinutes, OptionLevel, Occasion; SỬA RequestId từ 1:1 -> 1:N)
-- ----------------------------------------------------------------------------
CREATE TABLE diy_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id          UUID NOT NULL REFERENCES ai_requests(id) ON DELETE CASCADE, -- KHÔNG còn UNIQUE
    title               VARCHAR(255) NOT NULL,
    occasion            VARCHAR(100),                 -- VD: "Valentine", "Sinh nhật"
    option_level        option_level_enum NOT NULL DEFAULT 'Basic', -- thứ tự trong danh sách gợi ý
    difficulty          difficulty_enum NOT NULL DEFAULT 'Easy',
    estimated_minutes   INT,
    estimated_cost      DECIMAL(10,2),
    materials_json      JSONB,      -- snapshot: [{"materialId","name","priceAtGeneration","purchaseUrl","quantity"}]
    steps_json          JSONB,      -- [{"step":1,"description":"..."}]
    share_slug          VARCHAR(100) UNIQUE,   -- cho tính năng share link (SSR + SEO)
    is_public           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_diy_plans_user ON diy_plans(user_id);
CREATE INDEX idx_diy_plans_request ON diy_plans(request_id);
CREATE INDEX idx_diy_plans_share_slug ON diy_plans(share_slug);
CREATE INDEX idx_diy_plans_public ON diy_plans(is_public) WHERE is_public = TRUE;

-- ----------------------------------------------------------------------------
-- 12. DIY_PLAN_MATERIALS (BẢNG MỚI — junction table, chuẩn hoá liên kết
--     giữa DiyPlans và KnowledgeMaterials thay vì chỉ nhét JSONB rời rạc)
-- ----------------------------------------------------------------------------
CREATE TABLE diy_plan_materials (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diy_plan_id             UUID NOT NULL REFERENCES diy_plans(id) ON DELETE CASCADE,
    material_id             UUID REFERENCES knowledge_materials(id) ON DELETE SET NULL, -- NULL nếu AI tự bịa (không có trong KB)
    name_snapshot           VARCHAR(255) NOT NULL,
    price_snapshot          DECIMAL(10,2) NOT NULL,
    purchase_url_snapshot   TEXT,
    quantity                INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_plan_materials_plan ON diy_plan_materials(diy_plan_id);
CREATE INDEX idx_plan_materials_material ON diy_plan_materials(material_id);

-- ----------------------------------------------------------------------------
-- 13. DIY_PLAN_TUTORIALS (BẢNG MỚI — junction table, 1 Plan có thể đính kèm
--     nhiều video tutorial)
-- ----------------------------------------------------------------------------
CREATE TABLE diy_plan_tutorials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diy_plan_id     UUID NOT NULL REFERENCES diy_plans(id) ON DELETE CASCADE,
    tutorial_id     UUID REFERENCES knowledge_tutorials(id) ON DELETE SET NULL
);

CREATE INDEX idx_plan_tutorials_plan ON diy_plan_tutorials(diy_plan_id);
CREATE INDEX idx_plan_tutorials_tutorial ON diy_plan_tutorials(tutorial_id);

-- ============================================================================
-- GHI CHÚ TRIỂN KHAI VỚI EF CORE
-- ============================================================================
-- 1. Dùng Npgsql.EntityFrameworkCore.PostgreSQL + Npgsql (hỗ trợ native pgvector,
--    JSONB, UUID, ARRAY, ENUM qua HasPostgresEnum()).
-- 2. Query vector similarity trong LINQ, ví dụ:
--    var results = await db.KnowledgeMaterials
--        .OrderBy(m => m.Embedding.CosineDistance(queryEmbedding))
--        .Take(5)
--        .ToListAsync();
-- 3. Global Query Filter cho soft-delete Users:
--    modelBuilder.Entity<User>().HasQueryFilter(u => u.IsActive);
-- 4. Nhớ cấu hình HasPostgresExtension("vector") và HasPostgresExtension("pgcrypto")
--    trong OnModelCreating.
-- ============================================================================