using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedManualOfflineOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Ensure target customer account exists (inserts fallback row only on an empty DB if not yet registered)
                INSERT INTO users (id, email, full_name, role, password_hash, tier, is_active, created_at, updated_at)
                SELECT
                    'f0000000-0000-0000-0000-000000000001'::uuid,
                    'quynhchinguyen.010205@gmail.com22',
                    'Quỳnh Chi Nguyễn',
                    0,
                    NULL,
                    'Free'::user_tier_enum,
                    true,
                    now(),
                    now()
                WHERE NOT EXISTS (
                    SELECT 1 FROM users WHERE LOWER(BTRIM(email)) = 'quynhchinguyen.010205@gmail.com22'
                )
                ON CONFLICT DO NOTHING;

                INSERT INTO user_quotas (id, user_id, daily_limit, daily_requests_used, last_reset_date)
                SELECT
                    'f0000000-0000-0000-0000-000000000002'::uuid,
                    u.id,
                    5,
                    0,
                    date_trunc('day', now())
                FROM users u
                WHERE LOWER(BTRIM(u.email)) = 'quynhchinguyen.010205@gmail.com22'
                ORDER BY u.is_active DESC, u.created_at ASC
                LIMIT 1
                ON CONFLICT DO NOTHING;

                -- 2. Insert offline orders linked to quynhchinguyen.010205@gmail.com22
                --    Only orders whose required products all exist as active catalog items in DB are inserted;
                --    custom/missing-product orders (e.g. STT 19 'Móc ủi Custom') are skipped without creating dummy products.
                WITH target_user AS (
                    SELECT COALESCE(
                        (SELECT id FROM users WHERE LOWER(BTRIM(email)) = 'quynhchinguyen.010205@gmail.com22' ORDER BY is_active DESC, created_at ASC LIMIT 1),
                        (SELECT id FROM users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid LIMIT 1)
                    ) AS user_id
                ),
                catalog AS (
                    SELECT DISTINCT ON (norm_name)
                        p.id AS product_id,
                        REPLACE(
                            LOWER(
                                TRANSLATE(
                                    REGEXP_REPLACE(NORMALIZE(BTRIM(p.name)), '\s+', ' ', 'g'),
                                    'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ',
                                    'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ'
                                )
                            ),
                            'oá',
                            'óa'
                        ) AS norm_name
                    FROM products p
                    WHERE p.is_active = true
                    ORDER BY norm_name, p.created_at ASC
                ),
                raw_orders (order_id, order_code, ordered_at, receiver_name, receiver_phone, receiver_address, total_amount) AS (
                    VALUES
                        ('d0000000-0000-0000-0000-000000000001'::uuid, 'ORD-MANUAL-001', '2026-10-07 08:00:00+07'::timestamptz, 'Quỳnh Như', '0901234001', 'TP. Thủ Đức, TP. Hồ Chí Minh', 50000::numeric),
                        ('d0000000-0000-0000-0000-000000000002'::uuid, 'ORD-MANUAL-002', '2026-10-07 08:30:00+07'::timestamptz, 'Bảo Nguyên', '0901234002', 'Quận 1, TP. Hồ Chí Minh', 15000::numeric),
                        ('d0000000-0000-0000-0000-000000000003'::uuid, 'ORD-MANUAL-003', '2026-10-07 09:00:00+07'::timestamptz, 'Thầy Hiền', '0901234003', 'ĐH FPT, Khu Công Nghệ Cao, TP. Thủ Đức', 30000::numeric),
                        ('d0000000-0000-0000-0000-000000000004'::uuid, 'ORD-MANUAL-004', '2026-10-07 09:30:00+07'::timestamptz, 'Tiến', '0901234004', 'Bình Thạnh, TP. Hồ Chí Minh', 30000::numeric),
                        ('d0000000-0000-0000-0000-000000000005'::uuid, 'ORD-MANUAL-005', '2026-10-07 10:00:00+07'::timestamptz, 'Trúc', '0901234005', 'Gò Vấp, TP. Hồ Chí Minh', 15000::numeric),
                        ('d0000000-0000-0000-0000-000000000006'::uuid, 'ORD-MANUAL-006', '2026-10-07 10:30:00+07'::timestamptz, 'Vlinh', '0901234006', 'Quận 7, TP. Hồ Chí Minh', 50000::numeric),
                        ('d0000000-0000-0000-0000-000000000007'::uuid, 'ORD-MANUAL-007', '2026-10-07 11:00:00+07'::timestamptz, 'Tiên', '0901234007', 'Quận 3, TP. Hồ Chí Minh', 50000::numeric),
                        ('d0000000-0000-0000-0000-000000000021'::uuid, 'ORD-MANUAL-021', '2026-10-11 09:00:00+07'::timestamptz, 'Quang Tâm', '0901234021', 'Phú Nhuận, TP. Hồ Chí Minh', 50000::numeric),
                        ('d0000000-0000-0000-0000-000000000022'::uuid, 'ORD-MANUAL-022', '2026-10-11 10:00:00+07'::timestamptz, 'Nguyễn Quang Tân', '0901234022', 'ĐH FPT, TP. Thủ Đức', 45000::numeric),
                        ('d0000000-0000-0000-0000-000000000023'::uuid, 'ORD-MANUAL-023', '2026-10-11 14:30:00+07'::timestamptz, 'Duy Khánh', '0901234023', 'Quận 10, TP. Hồ Chí Minh', 75000::numeric),
                        ('d0000000-0000-0000-0000-000000000024'::uuid, 'ORD-MANUAL-024', '2026-10-11 15:30:00+07'::timestamptz, 'Kim Hà', '0901234024', 'Quận 5, TP. Hồ Chí Minh', 30000::numeric),
                        ('d0000000-0000-0000-0000-000000000035'::uuid, 'ORD-MANUAL-035', '2026-10-17 16:00:00+07'::timestamptz, 'Kỳ Vỹ', '0901234035', 'TP. Thủ Đức, TP. Hồ Chí Minh', 30000::numeric)
                ),
                raw_lines (order_code, norm_product_name) AS (
                    VALUES
                        ('ORD-MANUAL-001', 'móc khóa động vật'),
                        ('ORD-MANUAL-002', 'ngôi sao may mắn'),
                        ('ORD-MANUAL-003', 'ngôi sao may mắn'),
                        ('ORD-MANUAL-004', 'móc khóa len'),
                        ('ORD-MANUAL-005', 'móc khóa len'),
                        ('ORD-MANUAL-006', 'mô hình lego'),
                        ('ORD-MANUAL-006', 'gấu bông'),
                        ('ORD-MANUAL-007', 'móc khóa động vật'),
                        ('ORD-MANUAL-021', 'hoa kẽm nhung'),
                        ('ORD-MANUAL-022', 'ngôi sao may mắn'),
                        ('ORD-MANUAL-022', 'gấu bông'),
                        ('ORD-MANUAL-023', 'ngôi sao may mắn'),
                        ('ORD-MANUAL-023', 'cỏ may mắn'),
                        ('ORD-MANUAL-024', 'ngôi sao may mắn'),
                        ('ORD-MANUAL-024', 'cỏ may mắn'),
                        ('ORD-MANUAL-035', 'móc khóa ngôi sao')
                ),
                valid_order_codes AS (
                    SELECT rl.order_code
                    FROM raw_lines rl
                    LEFT JOIN catalog c ON c.norm_name = rl.norm_product_name
                    GROUP BY rl.order_code
                    HAVING BOOL_AND(c.product_id IS NOT NULL)
                )
                INSERT INTO orders (
                    id, user_id, order_code, order_kind, card_id, card_template_slug,
                    payment_method, payment_status, order_status, inventory_deducted,
                    is_archived, revision, paid_at, receiver_name, receiver_phone,
                    receiver_address, shipping_fee, total_amount, created_at, updated_at
                )
                SELECT
                    ro.order_id,
                    tu.user_id,
                    ro.order_code,
                    'Product',
                    NULL,
                    NULL,
                    'BankTransfer'::payment_method_enum,
                    'Paid'::payment_status_enum,
                    'Delivered'::order_status_enum,
                    true,
                    false,
                    1,
                    ro.ordered_at,
                    ro.receiver_name,
                    ro.receiver_phone,
                    ro.receiver_address,
                    0,
                    ro.total_amount,
                    ro.ordered_at,
                    ro.ordered_at
                FROM raw_orders ro
                JOIN valid_order_codes voc ON voc.order_code = ro.order_code
                CROSS JOIN target_user tu
                WHERE tu.user_id IS NOT NULL
                  AND NOT EXISTS (SELECT 1 FROM orders existing WHERE existing.order_code = ro.order_code)
                ON CONFLICT (id) DO NOTHING;

                -- 3. Insert order_items mapped directly to existing product IDs in DB
                WITH catalog AS (
                    SELECT DISTINCT ON (norm_name)
                        p.id AS product_id,
                        REPLACE(
                            LOWER(
                                TRANSLATE(
                                    REGEXP_REPLACE(NORMALIZE(BTRIM(p.name)), '\s+', ' ', 'g'),
                                    'ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ',
                                    'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ'
                                )
                            ),
                            'oá',
                            'óa'
                        ) AS norm_name
                    FROM products p
                    WHERE p.is_active = true
                    ORDER BY norm_name, p.created_at ASC
                ),
                raw_lines (item_id, order_code, norm_product_name, quantity, unit_price, sub_total) AS (
                    VALUES
                        ('c0000000-0000-0000-0001-000000000001'::uuid, 'ORD-MANUAL-001', 'móc khóa động vật', 1, 50000::numeric, 50000::numeric),
                        ('c0000000-0000-0000-0002-000000000001'::uuid, 'ORD-MANUAL-002', 'ngôi sao may mắn', 1, 15000::numeric, 15000::numeric),
                        ('c0000000-0000-0000-0003-000000000001'::uuid, 'ORD-MANUAL-003', 'ngôi sao may mắn', 1, 30000::numeric, 30000::numeric),
                        ('c0000000-0000-0000-0004-000000000001'::uuid, 'ORD-MANUAL-004', 'móc khóa len', 1, 30000::numeric, 30000::numeric),
                        ('c0000000-0000-0000-0005-000000000001'::uuid, 'ORD-MANUAL-005', 'móc khóa len', 1, 15000::numeric, 15000::numeric),
                        ('c0000000-0000-0000-0006-000000000001'::uuid, 'ORD-MANUAL-006', 'mô hình lego', 1, 20000::numeric, 20000::numeric),
                        ('c0000000-0000-0000-0006-000000000002'::uuid, 'ORD-MANUAL-006', 'gấu bông', 1, 30000::numeric, 30000::numeric),
                        ('c0000000-0000-0000-0007-000000000001'::uuid, 'ORD-MANUAL-007', 'móc khóa động vật', 1, 50000::numeric, 50000::numeric),
                        ('c0000000-0000-0000-0021-000000000001'::uuid, 'ORD-MANUAL-021', 'hoa kẽm nhung', 2, 25000::numeric, 50000::numeric),
                        ('c0000000-0000-0000-0022-000000000001'::uuid, 'ORD-MANUAL-022', 'ngôi sao may mắn', 1, 15000::numeric, 15000::numeric),
                        ('c0000000-0000-0000-0022-000000000002'::uuid, 'ORD-MANUAL-022', 'gấu bông', 1, 30000::numeric, 30000::numeric),
                        ('c0000000-0000-0000-0023-000000000001'::uuid, 'ORD-MANUAL-023', 'ngôi sao may mắn', 3, 15000::numeric, 45000::numeric),
                        ('c0000000-0000-0000-0023-000000000002'::uuid, 'ORD-MANUAL-023', 'cỏ may mắn', 2, 15000::numeric, 30000::numeric),
                        ('c0000000-0000-0000-0024-000000000001'::uuid, 'ORD-MANUAL-024', 'ngôi sao may mắn', 1, 15000::numeric, 15000::numeric),
                        ('c0000000-0000-0000-0024-000000000002'::uuid, 'ORD-MANUAL-024', 'cỏ may mắn', 1, 15000::numeric, 15000::numeric),
                        ('c0000000-0000-0000-0035-000000000001'::uuid, 'ORD-MANUAL-035', 'móc khóa ngôi sao', 2, 15000::numeric, 30000::numeric)
                )
                INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, sub_total, created_at)
                SELECT
                    rl.item_id,
                    o.id,
                    c.product_id,
                    rl.quantity,
                    rl.unit_price,
                    rl.sub_total,
                    o.created_at
                FROM raw_lines rl
                JOIN orders o ON o.order_code = rl.order_code
                JOIN catalog c ON c.norm_name = rl.norm_product_name
                WHERE NOT EXISTS (
                    SELECT 1 FROM order_items existing
                    WHERE existing.order_id = o.id AND existing.product_id = c.product_id
                )
                ON CONFLICT (id) DO NOTHING;

                -- 4. Insert financial receipt events for Admin Dashboard revenue reporting
                INSERT INTO order_financial_events (
                    id, order_id, user_id, order_code, order_kind, payment_method, kind,
                    occurred_at, recorded_at, merchandise_amount, shipping_amount
                )
                SELECT
                    gen_random_uuid(),
                    o.id,
                    o.user_id,
                    o.order_code,
                    o.order_kind,
                    o.payment_method::text,
                    'Receipt',
                    o.paid_at,
                    now(),
                    GREATEST(o.total_amount - o.shipping_fee, 0),
                    o.shipping_fee
                FROM orders o
                WHERE o.order_code LIKE 'ORD-MANUAL-%'
                  AND o.payment_status = 'Paid'::payment_status_enum
                ON CONFLICT (order_id, kind) DO NOTHING;

                -- 5. Insert financial lines mapped to actual product IDs & names for Top Selling report
                INSERT INTO order_financial_lines (id, event_id, product_key, product_name, quantity, amount)
                SELECT
                    gen_random_uuid(),
                    e.id,
                    oi.product_id::text,
                    COALESCE(p.name, oi.product_id::text),
                    oi.quantity,
                    oi.sub_total
                FROM order_financial_events e
                JOIN order_items oi ON oi.order_id = e.order_id
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE e.order_code LIKE 'ORD-MANUAL-%'
                  AND e.kind = 'Receipt'
                  AND NOT EXISTS (
                      SELECT 1 FROM order_financial_lines l
                      WHERE l.event_id = e.id AND l.product_key = oi.product_id::text
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Delete strictly in Child -> Parent foreign key order (Rule 6.1)
                DELETE FROM order_financial_lines
                WHERE event_id IN (
                    SELECT id FROM order_financial_events WHERE order_code LIKE 'ORD-MANUAL-%'
                );

                DELETE FROM order_financial_events
                WHERE order_code LIKE 'ORD-MANUAL-%';

                DELETE FROM gifts
                WHERE order_item_id IN (
                    SELECT oi.id
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE o.order_code LIKE 'ORD-MANUAL-%'
                );

                DELETE FROM order_items
                WHERE order_id IN (
                    SELECT id FROM orders WHERE order_code LIKE 'ORD-MANUAL-%'
                );

                DELETE FROM orders
                WHERE order_code LIKE 'ORD-MANUAL-%';

                DELETE FROM user_quotas
                WHERE user_id = 'f0000000-0000-0000-0000-000000000001'::uuid
                  AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = 'f0000000-0000-0000-0000-000000000001'::uuid);

                DELETE FROM users
                WHERE id = 'f0000000-0000-0000-0000-000000000001'::uuid
                  AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = 'f0000000-0000-0000-0000-000000000001'::uuid);
            ");
        }
    }
}
