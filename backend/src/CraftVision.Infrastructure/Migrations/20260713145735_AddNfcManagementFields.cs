using System;
using CraftVision.Domain.Enums;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNfcManagementFields : Migration
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

            migrationBuilder.AddColumn<int>(
                name: "role",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_scan_at",
                table: "nfc_tags",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "linked_url",
                table: "nfc_tags",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "scan_count",
                table: "nfc_tags",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "auth_provider", "avatar_url", "bio", "created_at", "display_name", "email", "full_name", "is_active", "password_hash", "phone", "provider_id", "role", "tier", "updated_at" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), null, null, null, new DateTime(2026, 7, 13, 14, 57, 33, 839, DateTimeKind.Utc).AddTicks(9664), null, "admin@craftvision.vn", "Admin", true, "admin", null, null, 1, UserTier.Premium, new DateTime(2026, 7, 13, 14, 57, 33, 840, DateTimeKind.Utc).AddTicks(46) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DropColumn(
                name: "role",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_scan_at",
                table: "nfc_tags");

            migrationBuilder.DropColumn(
                name: "linked_url",
                table: "nfc_tags");

            migrationBuilder.DropColumn(
                name: "scan_count",
                table: "nfc_tags");

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
        }
    }
}
