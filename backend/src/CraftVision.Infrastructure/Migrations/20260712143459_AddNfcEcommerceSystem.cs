using System;
using CraftVision.Domain.Enums;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNfcEcommerceSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .Annotation("Npgsql:Enum:file_type_enum", "Image,Video")
                .Annotation("Npgsql:Enum:gift_status_enum", "Active,Disabled,Draft")
                .Annotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .Annotation("Npgsql:Enum:media_type_enum", "Image,Video")
                .Annotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .Annotation("Npgsql:Enum:message_source_enum", "AI,Manual")
                .Annotation("Npgsql:Enum:model_type_enum", "GLB,GLTF,USDZ")
                .Annotation("Npgsql:Enum:nfc_status_enum", "Available,Disabled,Lost,Reserved,Sold")
                .Annotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .Annotation("Npgsql:Enum:order_status_enum", "Cancelled,Delivered,Pending,Processing,Producing,ReadyToShip,Shipped,WaitingProduction")
                .Annotation("Npgsql:Enum:payment_method_enum", "Cod,None")
                .Annotation("Npgsql:Enum:payment_status_enum", "Failed,Paid,Refunded,Unpaid")
                .Annotation("Npgsql:Enum:product_type_enum", "InStock,PreOrder")
                .Annotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .Annotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .Annotation("Npgsql:PostgresExtension:vector", ",,")
                .OldAnnotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .OldAnnotation("Npgsql:Enum:file_type_enum", "Image")
                .OldAnnotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .OldAnnotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .OldAnnotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .OldAnnotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .OldAnnotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .OldAnnotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.AddColumn<string>(
                name: "avatar_url",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cloudinary_id",
                table: "uploaded_files",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "duration",
                table: "uploaded_files",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "file_size",
                table: "uploaded_files",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "height",
                table: "uploaded_files",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mime_type",
                table: "uploaded_files",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "width",
                table: "uploaded_files",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "gift_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon = table.Column<string>(type: "text", nullable: true),
                    prompt_template = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gift_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "nfc_tags",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tag_code = table.Column<string>(type: "text", nullable: false),
                    secret_key = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<NfcStatus>(type: "nfc_status_enum", nullable: false),
                    activated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nfc_tags", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_code = table.Column<string>(type: "text", nullable: false),
                    payment_method = table.Column<PaymentMethod>(type: "payment_method_enum", nullable: false),
                    payment_status = table.Column<PaymentStatus>(type: "payment_status_enum", nullable: false),
                    order_status = table.Column<OrderStatus>(type: "order_status_enum", nullable: false),
                    receiver_name = table.Column<string>(type: "text", nullable: true),
                    receiver_phone = table.Column<string>(type: "text", nullable: true),
                    receiver_address = table.Column<string>(type: "text", nullable: true),
                    shipping_fee = table.Column<decimal>(type: "numeric", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_orders_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    slug = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_product_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "message_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_premium = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_message_templates", x => x.id);
                    table.ForeignKey(
                        name: "fk_message_templates_gift_categories_gift_category_id",
                        column: x => x.gift_category_id,
                        principalTable: "gift_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    sku = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    stock = table.Column<int>(type: "integer", nullable: false),
                    sample_image_url = table.Column<string>(type: "text", nullable: true),
                    product_type = table.Column<ProductType>(type: "product_type_enum", nullable: false),
                    supports_nfc = table.Column<bool>(type: "boolean", nullable: false),
                    estimated_production_days = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    row_version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_products", x => x.id);
                    table.ForeignKey(
                        name: "fk_products_product_categories_product_category_id",
                        column: x => x.product_category_id,
                        principalTable: "product_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    sub_total = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    product_id1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_items_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_order_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_order_items_products_product_id1",
                        column: x => x.product_id1,
                        principalTable: "products",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "product_images",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_thumbnail = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_product_images", x => x.id);
                    table.ForeignKey(
                        name: "fk_product_images_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_product_images_uploaded_files_file_id",
                        column: x => x.file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gifts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nfc_tag_id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_title = table.Column<string>(type: "text", nullable: true),
                    sender_name = table.Column<string>(type: "text", nullable: true),
                    receiver_name = table.Column<string>(type: "text", nullable: true),
                    message = table.Column<string>(type: "text", nullable: true),
                    theme = table.Column<string>(type: "text", nullable: true),
                    message_source = table.Column<MessageSource>(type: "message_source_enum", nullable: false),
                    three_d_model_url = table.Column<string>(type: "text", nullable: true),
                    three_d_prompt = table.Column<string>(type: "text", nullable: true),
                    preview_image_url = table.Column<string>(type: "text", nullable: true),
                    three_d_model_type = table.Column<ModelType>(type: "model_type_enum", nullable: true),
                    status = table.Column<GiftStatus>(type: "gift_status_enum", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gifts", x => x.id);
                    table.ForeignKey(
                        name: "fk_gifts_nfc_tags_nfc_tag_id",
                        column: x => x.nfc_tag_id,
                        principalTable: "nfc_tags",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_gifts_order_items_order_item_id",
                        column: x => x.order_item_id,
                        principalTable: "order_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gift_ai_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    relationship = table.Column<string>(type: "text", nullable: true),
                    writing_style = table.Column<string>(type: "text", nullable: true),
                    message_length = table.Column<string>(type: "text", nullable: true),
                    emoji_level = table.Column<string>(type: "text", nullable: true),
                    language = table.Column<string>(type: "text", nullable: true),
                    additional_context = table.Column<string>(type: "text", nullable: true),
                    design_prompt = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gift_ai_profiles", x => x.id);
                    table.ForeignKey(
                        name: "fk_gift_ai_profiles_gift_categories_gift_category_id",
                        column: x => x.gift_category_id,
                        principalTable: "gift_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_gift_ai_profiles_gifts_gift_id",
                        column: x => x.gift_id,
                        principalTable: "gifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gift_media",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_id = table.Column<Guid>(type: "uuid", nullable: false),
                    media_type = table.Column<MediaType>(type: "media_type_enum", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    caption = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gift_media", x => x.id);
                    table.ForeignKey(
                        name: "fk_gift_media_gifts_gift_id",
                        column: x => x.gift_id,
                        principalTable: "gifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_gift_media_uploaded_files_file_id",
                        column: x => x.file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scan_histories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gift_id = table.Column<Guid>(type: "uuid", nullable: false),
                    scanned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    device = table.Column<string>(type: "text", nullable: true),
                    location = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scan_histories", x => x.id);
                    table.ForeignKey(
                        name: "fk_scan_histories_gifts_gift_id",
                        column: x => x.gift_id,
                        principalTable: "gifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_gift_ai_profiles_gift_category_id",
                table: "gift_ai_profiles",
                column: "gift_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_gift_ai_profiles_gift_id",
                table: "gift_ai_profiles",
                column: "gift_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_gift_media_file_id",
                table: "gift_media",
                column: "file_id");

            migrationBuilder.CreateIndex(
                name: "ix_gift_media_gift_id",
                table: "gift_media",
                column: "gift_id");

            migrationBuilder.CreateIndex(
                name: "ix_gifts_nfc_tag_id",
                table: "gifts",
                column: "nfc_tag_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_gifts_order_item_id",
                table: "gifts",
                column: "order_item_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_message_templates_gift_category_id",
                table: "message_templates",
                column: "gift_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_order_id",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_product_id",
                table: "order_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_product_id1",
                table: "order_items",
                column: "product_id1");

            migrationBuilder.CreateIndex(
                name: "ix_orders_user_id",
                table: "orders",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_product_images_file_id",
                table: "product_images",
                column: "file_id");

            migrationBuilder.CreateIndex(
                name: "ix_product_images_product_id",
                table: "product_images",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_products_product_category_id",
                table: "products",
                column: "product_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_scan_histories_gift_id",
                table: "scan_histories",
                column: "gift_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "gift_ai_profiles");

            migrationBuilder.DropTable(
                name: "gift_media");

            migrationBuilder.DropTable(
                name: "message_templates");

            migrationBuilder.DropTable(
                name: "product_images");

            migrationBuilder.DropTable(
                name: "scan_histories");

            migrationBuilder.DropTable(
                name: "gift_categories");

            migrationBuilder.DropTable(
                name: "gifts");

            migrationBuilder.DropTable(
                name: "nfc_tags");

            migrationBuilder.DropTable(
                name: "order_items");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "products");

            migrationBuilder.DropTable(
                name: "product_categories");

            migrationBuilder.DropColumn(
                name: "avatar_url",
                table: "users");

            migrationBuilder.DropColumn(
                name: "cloudinary_id",
                table: "uploaded_files");

            migrationBuilder.DropColumn(
                name: "duration",
                table: "uploaded_files");

            migrationBuilder.DropColumn(
                name: "file_size",
                table: "uploaded_files");

            migrationBuilder.DropColumn(
                name: "height",
                table: "uploaded_files");

            migrationBuilder.DropColumn(
                name: "mime_type",
                table: "uploaded_files");

            migrationBuilder.DropColumn(
                name: "width",
                table: "uploaded_files");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .Annotation("Npgsql:Enum:file_type_enum", "Image")
                .Annotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .Annotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .Annotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .Annotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .Annotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .Annotation("Npgsql:PostgresExtension:vector", ",,")
                .OldAnnotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .OldAnnotation("Npgsql:Enum:file_type_enum", "Image,Video")
                .OldAnnotation("Npgsql:Enum:gift_status_enum", "Active,Disabled,Draft")
                .OldAnnotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .OldAnnotation("Npgsql:Enum:media_type_enum", "Image,Video")
                .OldAnnotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .OldAnnotation("Npgsql:Enum:message_source_enum", "AI,Manual")
                .OldAnnotation("Npgsql:Enum:model_type_enum", "GLB,GLTF,USDZ")
                .OldAnnotation("Npgsql:Enum:nfc_status_enum", "Available,Disabled,Lost,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .OldAnnotation("Npgsql:Enum:order_status_enum", "Cancelled,Delivered,Pending,Processing,Producing,ReadyToShip,Shipped,WaitingProduction")
                .OldAnnotation("Npgsql:Enum:payment_method_enum", "Cod,None")
                .OldAnnotation("Npgsql:Enum:payment_status_enum", "Failed,Paid,Refunded,Unpaid")
                .OldAnnotation("Npgsql:Enum:product_type_enum", "InStock,PreOrder")
                .OldAnnotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .OldAnnotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .OldAnnotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");
        }
    }
}
