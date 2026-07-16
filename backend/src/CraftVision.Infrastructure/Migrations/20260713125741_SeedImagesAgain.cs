using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedImagesAgain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
DECLARE
    rec RECORD;
    v_user_id UUID := '11111111-1111-1111-1111-111111111111';
    v_file_id UUID;
    img_url TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
        INSERT INTO users (id, email, full_name, password_hash, is_active, tier, created_at, updated_at)
        VALUES (v_user_id, 'mock@craftvision.com', 'Mock User', 'MOCK', true, 'Free'::user_tier_enum, now(), now());
    END IF;
    DELETE FROM product_images;
    FOR rec IN SELECT id, name FROM products LOOP
        img_url := NULL;
        IF rec.name ILIKE '%charm%' THEN img_url := '/image/charm.jpg';
        ELSIF rec.name ILIKE '%kh_a%' THEN img_url := '/image/mockhoa2.jpg';
        ELSIF rec.name ILIKE '%hoa%' THEN img_url := '/image/hoa.png';
        ELSIF rec.name ILIKE '%chuy_n%' THEN img_url := '/image/vongco.jpg';
        ELSIF rec.name ILIKE '%tay%' THEN img_url := '/image/vongtay.jpg';
        ELSIF rec.name ILIKE '%len%' THEN img_url := '/image/moclen.jpg';
        ELSE img_url := '/image/charmdatnang.jpg';
        END IF;
        IF img_url IS NOT NULL THEN
            v_file_id := gen_random_uuid();
            INSERT INTO uploaded_files (id, user_id, file_url, file_type, created_at)
            VALUES (v_file_id, v_user_id, img_url, 'Image'::file_type_enum, now());
            INSERT INTO product_images (id, product_id, file_id, display_order, is_thumbnail)
            VALUES (gen_random_uuid(), rec.id, v_file_id, 0, true);
        END IF;
    END LOOP;
END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM product_images;");
        }
    }
}
