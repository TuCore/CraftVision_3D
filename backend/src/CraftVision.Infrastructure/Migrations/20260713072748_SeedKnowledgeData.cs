using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedKnowledgeData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- Seed Knowledge Materials ---
            migrationBuilder.Sql(@"
                INSERT INTO knowledge_materials (id, name, category, current_price, unit, purchase_url, image_url, is_active, last_checked_at, created_at)
                VALUES
                    (gen_random_uuid(), '100 Móc khóa càng cua', 'Dụng cụ cơ bản', 46000, 'pack'::material_unit_enum, 'https://shopee.vn/100-M%C3%B3c-kh%C3%B3a-c%C3%A0ng-cua-i.651016585.40600362048', '', true, NOW(), NOW()),
                    (gen_random_uuid(), 'Set 200 Hạt Cườm Vuông acrylic 4mm Tự Xỏ Vòng Tay Thời Trang', 'Hạt/Charm', 29358, 'set'::material_unit_enum, 'https://shopee.vn/search?keyword=Set%201100%20h%E1%BA%A1t%20c%C6%B0%E1%BB%9Dm%20acrylic%20nhi%E1%BB%81u%20m%C3%A0u%20ch%E1%BB%AF%20A', '', true, NOW(), NOW()),
                    (gen_random_uuid(), 'Bông gòn bi loại 1, nhồi thú bông handmade Amigurumi', 'Dụng cụ cơ bản', 18000, 'pack'::material_unit_enum, 'https://shopee.vn/search?keyword=len%20milk%20cotton', '', true, NOW(), NOW()),
                    (gen_random_uuid(), '1800 hạt cườm thủy tinh 2mm lỗ 1mm làm trang sức', 'Hạt/Charm', 18942, 'pack'::material_unit_enum, 'https://shopee.vn/1800-h%E1%BA%A1t-c%C6%B0%E1%BB%9Dm-th%E1%BB%A7y-tinh-2mm-l%E1%BB%97-1mm-l%C3%A0m-trang-s%E1%BB%A9c-th%E1%BB%A7-c%C3%B4ng-ti%E1%BB%87n-l%E1%BB%A3i-i.379903869.7483443834', '', true, NOW(), NOW()),
                    (gen_random_uuid(), 'Dây sáp bóng Hàn Quốc dẹp 0.8mm đan vòng handmade', 'Dây/Len', 90000, 'piece'::material_unit_enum, 'https://shopee.vn/D%C3%A2y-s%C3%A1p-b%C3%B3ng-H%C3%A0n-Qu%E1%BB%91c-d%E1%BA%B9p-0.8mm-(-cu%E1%BB%99n-)-l%C3%A0m-v%C3%B2ng-handmade-B%E1%BA%A3ng-m%C3%A0u-1-2-i.8569698.1803346122', '', true, NOW(), NOW()),
                    (gen_random_uuid(), 'Đất Sét Tự Khô Deli Túi 250/500gr nặn hình mẫu trang trí', 'Keo/Resin/Khuôn', 87000, 'pack'::material_unit_enum, 'https://shopee.vn/%C4%90%E1%BA%A5t-S%C3%A9t-T%E1%BB%B1-Kh%C3%B4-Deli-%C4%90%E1%BA%A5t-S%C3%A9t-M%E1%BB%B9-Thu%E1%BA%ADt-T%C3%BAi-250-500gr-An-To%C3%A0n-Kh%C3%B4ng-M%C3%B9i-L%C3%A0m-Khu%C3%B4n-N%E1%BA%B7n-H%C3%ACnh-M%E1%BA%ABu-Trang-Tr%C3%AD-%C4%90a-%E1%BB%A8ng-D%E1%BB%A5ng-i.1021392906.29968013560', '', true, NOW(), NOW()),
                    (gen_random_uuid(), '100gam charm mix các kiểu theo tone màu có lỗ làm phụ kiện', 'Hạt/Charm', 25990, 'pack'::material_unit_enum, 'https://shopee.vn/list/c%C3%A2y%20h%E1%BA%A1t%20c%C6%B0%E1%BB%9Dm', '', true, NOW(), NOW())
                ;
            ");

            // --- Seed Knowledge Tutorials ---
            migrationBuilder.Sql(@"
                INSERT INTO knowledge_tutorials (id, title, video_url, difficulty, estimated_minutes, created_at)
                VALUES
                    (gen_random_uuid(), 'Cách xỏ hạt cườm làm móc khóa pixel hình Hello Kitty', 'https://www.youtube.com/watch?v=omp7J8sVJ0U', 'Easy'::difficulty_enum, 45, NOW()),
                    (gen_random_uuid(), 'Đổ keo Resin làm charm gấu nhựa, thú nhỏ dễ thương', 'https://www.youtube.com/watch?v=fYA8eIQyO2I', 'Medium'::difficulty_enum, 60, NOW()),
                    (gen_random_uuid(), 'Hướng dẫn tự làm lắc tay charm sành điệu', 'https://www.youtube.com/watch?v=Uy5R09W7r8c', 'Easy'::difficulty_enum, 30, NOW())
                ;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove seeded materials
            migrationBuilder.Sql(@"
                DELETE FROM knowledge_materials 
                WHERE name IN (
                    '100 Móc khóa càng cua',
                    'Set 200 Hạt Cườm Vuông acrylic 4mm Tự Xỏ Vòng Tay Thời Trang',
                    'Bông gòn bi loại 1, nhồi thú bông handmade Amigurumi',
                    '1800 hạt cườm thủy tinh 2mm lỗ 1mm làm trang sức',
                    'Dây sáp bóng Hàn Quốc dẹp 0.8mm đan vòng handmade',
                    'Đất Sét Tự Khô Deli Túi 250/500gr nặn hình mẫu trang trí',
                    '100gam charm mix các kiểu theo tone màu có lỗ làm phụ kiện'
                );
            ");

            // Remove seeded tutorials
            migrationBuilder.Sql(@"
                DELETE FROM knowledge_tutorials 
                WHERE title IN (
                    'Cách xỏ hạt cườm làm móc khóa pixel hình Hello Kitty',
                    'Đổ keo Resin làm charm gấu nhựa, thú nhỏ dễ thương',
                    'Hướng dẫn tự làm lắc tay charm sành điệu'
                );
            ");
        }
    }
}
