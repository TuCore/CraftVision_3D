using System;
using CraftVision.Domain.Enums;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedMockNfcTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "nfc_tags",
                columns: new[] { "id", "activated_at", "created_at", "last_scan_at", "linked_url", "scan_count", "secret_key", "status", "tag_code", "updated_at" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), null, new DateTime(2026, 7, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 13, 10, 0, 0, 0, DateTimeKind.Utc), "https://craftvision.vn/nfc/abcxyz", 15, "abc", NfcStatus.Active, "NFC000001", new DateTime(2026, 7, 13, 10, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("22222222-2222-2222-2222-222222222222"), null, new DateTime(2026, 7, 11, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, "def", NfcStatus.Available, "NFC000002", new DateTime(2026, 7, 11, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("33333333-3333-3333-3333-333333333333"), null, new DateTime(2026, 7, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 12, 10, 0, 0, 0, DateTimeKind.Utc), "https://craftvision.vn/nfc/xyz123", 3, "ghi", NfcStatus.Disabled, "NFC000003", new DateTime(2026, 7, 12, 10, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "nfc_tags",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "nfc_tags",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "nfc_tags",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 7, 13, 14, 57, 33, 839, DateTimeKind.Utc).AddTicks(9664), new DateTime(2026, 7, 13, 14, 57, 33, 840, DateTimeKind.Utc).AddTicks(46) });
        }
    }
}
