using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMockCategoriesAndTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Seed product_categories
                INSERT INTO product_categories (id, name, slug, description, icon, display_order, is_active, created_at, updated_at) VALUES 
                ('11111111-1111-1111-1111-111111111001', 'Birthday Gifts', 'birthday-gifts', 'Birthday gift collection', 'cake', 1, true, now(), now()),
                ('11111111-1111-1111-1111-111111111002', 'Wedding Gifts', 'wedding-gifts', 'Wedding collection', 'rings', 2, true, now(), now()),
                ('11111111-1111-1111-1111-111111111003', 'Anniversary Gifts', 'anniversary-gifts', 'Anniversary collection', 'heart', 3, true, now(), now()),
                ('11111111-1111-1111-1111-111111111004', 'Graduation Gifts', 'graduation-gifts', 'Graduation collection', 'graduation-cap', 4, true, now(), now()),
                ('11111111-1111-1111-1111-111111111005', 'Home Decor', 'home-decor', 'Decoration products', 'home', 5, true, now(), now()),
                ('11111111-1111-1111-1111-111111111006', 'Couple Collection', 'couple-collection', 'Gift for couples', 'gift', 6, true, now(), now()),
                ('11111111-1111-1111-1111-111111111007', 'Handmade', 'handmade', 'Handmade products', 'brush', 7, true, now(), now()),
                ('11111111-1111-1111-1111-111111111008', 'Premium', 'premium', 'Premium collection', 'diamond', 8, true, now(), now()),
                ('11111111-1111-1111-1111-111111111009', 'Limited Edition', 'limited-edition', 'Limited products', 'star', 9, true, now(), now()),
                ('11111111-1111-1111-1111-111111111010', 'Seasonal', 'seasonal', 'Seasonal gifts', 'calendar', 10, true, now(), now())
                ON CONFLICT DO NOTHING;

                -- Seed gift_categories
                INSERT INTO gift_categories (id, name, slug, description, icon, prompt_template, display_order, is_active, created_at) VALUES 
                ('22222222-2222-2222-2222-222222222001', 'Birthday', 'birthday', 'Birthday wishes', 'cake', 'Generate a warm birthday message.', 1, true, now()),
                ('22222222-2222-2222-2222-222222222002', 'Wedding', 'wedding', 'Wedding wishes', 'rings', 'Generate a wedding blessing.', 2, true, now()),
                ('22222222-2222-2222-2222-222222222003', 'Anniversary', 'anniversary', 'Anniversary messages', 'heart', 'Generate an anniversary message.', 3, true, now()),
                ('22222222-2222-2222-2222-222222222004', 'Graduation', 'graduation', 'Graduation wishes', 'graduation-cap', 'Generate a graduation congratulation.', 4, true, now()),
                ('22222222-2222-2222-2222-222222222005', 'Christmas', 'christmas', 'Christmas wishes', 'tree', 'Generate a Christmas greeting.', 5, true, now()),
                ('22222222-2222-2222-2222-222222222006', 'Valentine', 'valentine', 'Valentine messages', 'heart', 'Generate a romantic message.', 6, true, now()),
                ('22222222-2222-2222-2222-222222222007', 'Thank You', 'thank-you', 'Thank you messages', 'gift', 'Generate a thank you message.', 7, true, now()),
                ('22222222-2222-2222-2222-222222222008', 'Apology', 'apology', 'Apology messages', 'handshake', 'Generate an apology message.', 8, true, now()),
                ('22222222-2222-2222-2222-222222222009', 'Housewarming', 'housewarming', 'Housewarming wishes', 'home', 'Generate a housewarming message.', 9, true, now()),
                ('22222222-2222-2222-2222-222222222010', 'Business Opening', 'grand-opening', 'Business opening wishes', 'building', 'Generate a grand opening message.', 10, true, now())
                ON CONFLICT DO NOTHING;

                -- Seed nfc_tags (Status = 'Available')
                INSERT INTO nfc_tags (id, tag_code, secret_key, status, created_at, updated_at) VALUES 
                ('33333333-3333-3333-3333-333333333001', 'NFC000001', 'CV3D_8FJ4K91A', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333002', 'NFC000002', 'CV3D_X8M2Q7LA', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333003', 'NFC000003', 'CV3D_K9P4T6ZR', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333004', 'NFC000004', 'CV3D_D7L5V2QN', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333005', 'NFC000005', 'CV3D_J2R8N5MW', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333006', 'NFC000006', 'CV3D_P4X7H1BE', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333007', 'NFC000007', 'CV3D_U5A8C2LK', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333008', 'NFC000008', 'CV3D_W9M3E7QP', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333009', 'NFC000009', 'CV3D_F6Y1T8ZX', 'Available'::nfc_status_enum, now(), now()),
                ('33333333-3333-3333-3333-333333333010', 'NFC000010', 'CV3D_H3N9R5VU', 'Available'::nfc_status_enum, now(), now())
                ON CONFLICT DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM nfc_tags WHERE id::text LIKE '33333333-%';
                DELETE FROM gift_categories WHERE id::text LIKE '22222222-%';
                DELETE FROM product_categories WHERE id::text LIKE '11111111-%';
            ");
        }
    }
}
