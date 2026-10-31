using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PurgeTestDigitalCardOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Purge all legacy test DigitalCard orders (70000000*) created up to 2026-10-31 (UTC+7).
                -- Strictly follows Child -> Parent foreign key deletion order (Rule 6.1).

                -- 1. Remove financial line items so Top Selling & Cards Sold reports exclude test data
                DELETE FROM order_financial_lines
                WHERE event_id IN (
                    SELECT e.id
                    FROM order_financial_events e
                    JOIN orders o ON o.id = e.order_id
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                -- 2. Remove financial events (ON DELETE RESTRICT on orders.id) so Dashboard revenue excludes test data
                DELETE FROM order_financial_events
                WHERE order_id IN (
                    SELECT o.id
                    FROM orders o
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                -- 3. Remove any gift child records if present
                DELETE FROM scan_histories
                WHERE gift_id IN (
                    SELECT g.id
                    FROM gifts g
                    JOIN order_items oi ON oi.id = g.order_item_id
                    JOIN orders o ON o.id = oi.order_id
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                DELETE FROM gift_ai_profiles
                WHERE gift_id IN (
                    SELECT g.id
                    FROM gifts g
                    JOIN order_items oi ON oi.id = g.order_item_id
                    JOIN orders o ON o.id = oi.order_id
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                DELETE FROM gift_media
                WHERE gift_id IN (
                    SELECT g.id
                    FROM gifts g
                    JOIN order_items oi ON oi.id = g.order_item_id
                    JOIN orders o ON o.id = oi.order_id
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                -- 4. Release any reserved NFC tags back to Available before deleting gifts
                UPDATE nfc_tags
                SET status = 'Available'::nfc_status_enum,
                    linked_url = NULL,
                    updated_at = now()
                WHERE status = 'Reserved'::nfc_status_enum
                  AND id IN (
                      SELECT g.nfc_tag_id
                      FROM gifts g
                      JOIN order_items oi ON oi.id = g.order_item_id
                      JOIN orders o ON o.id = oi.order_id
                      WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                        AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                  );

                -- 5. Remove gifts and order_items
                DELETE FROM gifts
                WHERE order_item_id IN (
                    SELECT oi.id
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                DELETE FROM order_items
                WHERE order_id IN (
                    SELECT o.id
                    FROM orders o
                    WHERE (o.order_kind = 'DigitalCard' OR o.order_code LIKE '70000000%')
                      AND o.created_at <= '2026-10-31 23:59:59+07'::timestamptz
                );

                -- 6. Remove the junk/test DigitalCard orders themselves
                DELETE FROM orders
                WHERE (order_kind = 'DigitalCard' OR order_code LIKE '70000000%')
                  AND created_at <= '2026-10-31 23:59:59+07'::timestamptz;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Intentional no-op: purged legacy test DigitalCard orders should not be restored.
        }
    }
}
