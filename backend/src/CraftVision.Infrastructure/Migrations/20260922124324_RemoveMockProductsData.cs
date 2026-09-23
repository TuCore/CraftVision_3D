using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMockProductsData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Xóa các bản ghi quà tặng liên kết với các order_item chứa mock product (nếu có)
                DELETE FROM gifts WHERE order_item_id IN (
                    SELECT id FROM order_items WHERE product_id::text IN (
                        '11111111-1111-1111-1111-111111111111',
                        '22222222-2222-2222-2222-222222222222',
                        '33333333-3333-3333-3333-333333333333',
                        '44444444-4444-4444-4444-444444444444',
                        '55555555-5555-5555-5555-555555555555',
                        '66666666-6666-6666-6666-666666666666',
                        '77777777-7777-7777-7777-777777777777',
                        '88888888-8888-8888-8888-888888888888',
                        '99999999-9999-9999-9999-999999999999',
                        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                    )
                );

                -- 2. Xóa các order_item đang tham chiếu tới các mock product này
                DELETE FROM order_items WHERE product_id::text IN (
                    '11111111-1111-1111-1111-111111111111',
                    '22222222-2222-2222-2222-222222222222',
                    '33333333-3333-3333-3333-333333333333',
                    '44444444-4444-4444-4444-444444444444',
                    '55555555-5555-5555-5555-555555555555',
                    '66666666-6666-6666-6666-666666666666',
                    '77777777-7777-7777-7777-777777777777',
                    '88888888-8888-8888-8888-888888888888',
                    '99999999-9999-9999-9999-999999999999',
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                );

                -- 3. Xóa ảnh sản phẩm của các mock product này
                DELETE FROM product_images WHERE product_id::text IN (
                    '11111111-1111-1111-1111-111111111111',
                    '22222222-2222-2222-2222-222222222222',
                    '33333333-3333-3333-3333-333333333333',
                    '44444444-4444-4444-4444-444444444444',
                    '55555555-5555-5555-5555-555555555555',
                    '66666666-6666-6666-6666-666666666666',
                    '77777777-7777-7777-7777-777777777777',
                    '88888888-8888-8888-8888-888888888888',
                    '99999999-9999-9999-9999-999999999999',
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                );

                -- 4. Xóa các mock product
                DELETE FROM products WHERE id::text IN (
                    '11111111-1111-1111-1111-111111111111',
                    '22222222-2222-2222-2222-222222222222',
                    '33333333-3333-3333-3333-333333333333',
                    '44444444-4444-4444-4444-444444444444',
                    '55555555-5555-5555-5555-555555555555',
                    '66666666-6666-6666-6666-666666666666',
                    '77777777-7777-7777-7777-777777777777',
                    '88888888-8888-8888-8888-888888888888',
                    '99999999-9999-9999-9999-999999999999',
                    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
