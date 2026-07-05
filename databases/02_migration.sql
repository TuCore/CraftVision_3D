-- ============================================================================
-- MIGRATION 002 — Chạy trên DB ĐÃ CÓ SẴN (đã chạy database_schema.sql trước đó)
-- Nội dung: search_keywords, currency VNĐ -> INT, cờ is_selected
-- Nếu tạo DB mới từ đầu: dùng database_schema.sql (đã tích hợp sẵn), KHÔNG
-- cần chạy file này.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Extension cho fuzzy/ILIKE search
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- 1. SEARCH KEYWORDS — fallback khi purchase_url chết/hết hàng
-- ----------------------------------------------------------------------------
ALTER TABLE knowledge_materials
    ADD COLUMN IF NOT EXISTS search_keywords VARCHAR(255); -- VD: "dây da sáp 2mm shopee"

ALTER TABLE diy_plan_materials
    ADD COLUMN IF NOT EXISTS search_keywords_snapshot VARCHAR(255);

-- Index trigram để query ILIKE '%từ khóa%' nhanh khi cần tìm thủ công
CREATE INDEX IF NOT EXISTS idx_knowledge_materials_search_trgm
    ON knowledge_materials USING gin ((name || ' ' || coalesce(search_keywords, '')) gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 2. CURRENCY — VNĐ không có xu/hào, đổi DECIMAL(10,2) -> INT
--    Dùng ROUND(...)::INT để không lỗi khi cột đang có data (VD 30000.50 -> 30001)
-- ----------------------------------------------------------------------------
ALTER TABLE knowledge_materials
    ALTER COLUMN current_price TYPE INT USING ROUND(current_price)::INT;

ALTER TABLE diy_plans
    ALTER COLUMN estimated_cost TYPE INT USING ROUND(estimated_cost)::INT;

ALTER TABLE diy_plan_materials
    ALTER COLUMN price_snapshot TYPE INT USING ROUND(price_snapshot)::INT;

-- ----------------------------------------------------------------------------
-- 3. IS_SELECTED — cờ "đã chốt" cho DiyPlans (1 request có thể có nhiều plan
--    Basic/Intermediate/Advanced, user chỉ chọn 1 để xem lại/share)
-- ----------------------------------------------------------------------------
ALTER TABLE diy_plans
    ADD COLUMN IF NOT EXISTS is_selected BOOLEAN NOT NULL DEFAULT FALSE;

-- Đảm bảo mỗi request chỉ có TỐI ĐA 1 plan được is_selected = TRUE
CREATE UNIQUE INDEX IF NOT EXISTS idx_diy_plans_one_selected_per_request
    ON diy_plans(request_id) WHERE is_selected = TRUE;

COMMIT;

-- ============================================================================
-- GHI CHÚ
-- ============================================================================
-- 1. USING ROUND(...)::INT sẽ làm tròn phần thập phân hiện có trong data cũ
--    (nếu có). Vì hệ thống chỉ mới build, rủi ro mất dữ liệu gần như không có,
--    nhưng vẫn nên backup trước khi chạy trên môi trường có data thật.
-- 2. Unique index idx_diy_plans_one_selected_per_request sẽ tự động THẤT BẠI
--    nếu hiện tại đã có >1 plan cùng request_id với is_selected = TRUE (khó xảy
--    ra vì cột mới thêm default FALSE, nhưng cần biết nếu migration báo lỗi).
-- ============================================================================