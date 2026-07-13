using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMockProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO products (id, product_category_id, name, description, price, stock, product_type, supports_nfc, is_active, created_at, updated_at) VALUES 
                ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111007', 'Charm hạt cơ bản', 'Charm hạt nhựa cơ bản dễ thương, thích hợp để xỏ vòng tay hoặc vòng cổ tự làm.', 35000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111007', 'Charm đất sét nặn', 'Charm làm từ đất sét tự nặn tỉ mỉ, độc đáo và đầy màu sắc.', 35000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111007', 'Charm nhựa trong suốt', 'Charm nhựa trong bắt sáng cực tốt, điểm nhấn lấp lánh cho món trang sức của bạn.', 35000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111007', 'Móc khóa nhựa dễ thương', 'Móc khóa nhựa in hình các nhân vật đáng yêu, món quà nhỏ mang nhiều ý nghĩa.', 35000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111007', 'Móc khóa len gấu', 'Móc khoá đan len thủ công hình gấu cực kỳ mềm mại, chi tiết sắc sảo.', 65000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111007', 'Móc khóa len hình thú', 'Móc khoá len hình thú đa dạng, cực kỳ ngộ nghĩnh dùng để treo cặp balo.', 65000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111007', 'Dây chuyền đính charm', 'Dây chuyền thanh lịch với các charm nhỏ nhắn, tôn lên vẻ nữ tính dịu dàng.', 120000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111007', 'Vòng tay chuỗi hạt', 'Vòng tay chuỗi hạt màu pastel thủ công, phối màu cực kỳ dễ phối đồ.', 100000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111007', 'Vòng tay chuỗi hạt màu sắc', 'Vòng tay xỏ hạt kết hợp nhiều kiểu dáng lạ mắt, mang lại cá tính riêng.', 100000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111007', 'Vòng tay hạt dễ thương', 'Vòng tay được làm từ các loại hạt cườm ngộ nghĩnh, phù hợp với phong cách kẹo ngọt.', 100000, 100, 'InStock'::product_type_enum, true, true, now(), now()),
                ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111007', 'Vòng tay kim loại cá tính', 'Vòng tay kim loại phong cách năng động, không gỉ sét, phù hợp nam nữ.', 150000, 100, 'InStock'::product_type_enum, true, true, now(), now())
                ON CONFLICT DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
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
    }
}
