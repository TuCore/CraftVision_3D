using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMobileCommerceApis : Migration
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
                .Annotation("Npgsql:Enum:nfc_status_enum", "Active,Available,Disabled,Lost,Reserved,Sold")
                .Annotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .Annotation("Npgsql:Enum:order_status_enum", "Cancelled,Delivered,Pending,Processing,Producing,ReadyToShip,Shipped,WaitingProduction")
                .Annotation("Npgsql:Enum:payment_method_enum", "BankTransfer,Cod,None")
                .Annotation("Npgsql:Enum:payment_status_enum", "Failed,Paid,Refunded,Unpaid")
                .Annotation("Npgsql:Enum:product_type_enum", "InStock,PreOrder")
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
                .OldAnnotation("Npgsql:Enum:nfc_status_enum", "Active,Available,Disabled,Lost,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .OldAnnotation("Npgsql:Enum:order_status_enum", "Cancelled,Delivered,Pending,Processing,Producing,ReadyToShip,Shipped,WaitingProduction")
                .OldAnnotation("Npgsql:Enum:payment_method_enum", "Cod,None")
                .OldAnnotation("Npgsql:Enum:payment_status_enum", "Failed,Paid,Refunded,Unpaid")
                .OldAnnotation("Npgsql:Enum:product_type_enum", "InStock,PreOrder")
                .OldAnnotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .OldAnnotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .OldAnnotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.CreateTable(
                name: "cart_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cart_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_cart_items_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_cart_items_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "device_push_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    platform = table.Column<string>(type: "text", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_device_push_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_device_push_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "favorites",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_favorites", x => x.id);
                    table.ForeignKey(
                        name: "fk_favorites_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_favorites_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_password_reset_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_password_reset_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vouchers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "text", nullable: false),
                    discount_percent = table.Column<decimal>(type: "numeric", nullable: false),
                    maximum_discount = table.Column<decimal>(type: "numeric", nullable: true),
                    minimum_order_amount = table.Column<decimal>(type: "numeric", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    starts_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ends_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vouchers", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_cart_items_product_id",
                table: "cart_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_cart_items_user_id_product_id",
                table: "cart_items",
                columns: new[] { "user_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_device_push_tokens_token",
                table: "device_push_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_device_push_tokens_user_id",
                table: "device_push_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_favorites_product_id",
                table: "favorites",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_favorites_user_id_product_id",
                table: "favorites",
                columns: new[] { "user_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_token_hash",
                table: "password_reset_tokens",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_user_id",
                table: "password_reset_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_notifications_user_id",
                table: "user_notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_vouchers_code",
                table: "vouchers",
                column: "code",
                unique: true);

            migrationBuilder.InsertData(
                table: "vouchers",
                columns: new[] { "id", "code", "discount_percent", "maximum_discount", "minimum_order_amount", "is_active", "starts_at", "ends_at" },
                values: new object[]
                {
                    new Guid("11111111-1111-1111-1111-111111111111"),
                    "WELCOME10",
                    10m,
                    100000m,
                    200000m,
                    true,
                    new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cart_items");

            migrationBuilder.DropTable(
                name: "device_push_tokens");

            migrationBuilder.DropTable(
                name: "favorites");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropTable(
                name: "user_notifications");

            migrationBuilder.DropTable(
                name: "vouchers");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .Annotation("Npgsql:Enum:file_type_enum", "Image,Video")
                .Annotation("Npgsql:Enum:gift_status_enum", "Active,Disabled,Draft")
                .Annotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .Annotation("Npgsql:Enum:media_type_enum", "Image,Video")
                .Annotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .Annotation("Npgsql:Enum:message_source_enum", "AI,Manual")
                .Annotation("Npgsql:Enum:model_type_enum", "GLB,GLTF,USDZ")
                .Annotation("Npgsql:Enum:nfc_status_enum", "Active,Available,Disabled,Lost,Reserved,Sold")
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
                .OldAnnotation("Npgsql:Enum:file_type_enum", "Image,Video")
                .OldAnnotation("Npgsql:Enum:gift_status_enum", "Active,Disabled,Draft")
                .OldAnnotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .OldAnnotation("Npgsql:Enum:media_type_enum", "Image,Video")
                .OldAnnotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .OldAnnotation("Npgsql:Enum:message_source_enum", "AI,Manual")
                .OldAnnotation("Npgsql:Enum:model_type_enum", "GLB,GLTF,USDZ")
                .OldAnnotation("Npgsql:Enum:nfc_status_enum", "Active,Available,Disabled,Lost,Reserved,Sold")
                .OldAnnotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .OldAnnotation("Npgsql:Enum:order_status_enum", "Cancelled,Delivered,Pending,Processing,Producing,ReadyToShip,Shipped,WaitingProduction")
                .OldAnnotation("Npgsql:Enum:payment_method_enum", "BankTransfer,Cod,None")
                .OldAnnotation("Npgsql:Enum:payment_status_enum", "Failed,Paid,Refunded,Unpaid")
                .OldAnnotation("Npgsql:Enum:product_type_enum", "InStock,PreOrder")
                .OldAnnotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .OldAnnotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .OldAnnotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");

        }
    }
}
