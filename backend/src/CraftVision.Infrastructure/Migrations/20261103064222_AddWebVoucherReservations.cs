using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWebVoucherReservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "vouchers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "created_by",
                table: "vouchers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "customer_limit",
                table: "vouchers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "revision",
                table: "vouchers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "discount_amount",
                table: "orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "discount_percent",
                table: "orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "merchandise_discount",
                table: "orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "original_total",
                table: "orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "shipping_discount",
                table: "orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "voucher_code",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "voucher_usages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    voucher_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    reserved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    used_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    released_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    revision = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_voucher_usages", x => x.id);
                    table.ForeignKey(
                        name: "fk_voucher_usages_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_voucher_usages_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_voucher_usages_vouchers_voucher_id",
                        column: x => x.voucher_id,
                        principalTable: "vouchers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_voucher_usages_order_id",
                table: "voucher_usages",
                column: "order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_voucher_usages_status_expires_at",
                table: "voucher_usages",
                columns: new[] { "status", "expires_at" });

            migrationBuilder.CreateIndex(
                name: "ix_voucher_usages_user_id",
                table: "voucher_usages",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_voucher_usages_voucher_id_user_id",
                table: "voucher_usages",
                columns: new[] { "voucher_id", "user_id" },
                unique: true,
                filter: "status IN ('Reserved', 'Used')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "voucher_usages");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "vouchers");

            migrationBuilder.DropColumn(
                name: "created_by",
                table: "vouchers");

            migrationBuilder.DropColumn(
                name: "customer_limit",
                table: "vouchers");

            migrationBuilder.DropColumn(
                name: "revision",
                table: "vouchers");

            migrationBuilder.DropColumn(
                name: "discount_amount",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "discount_percent",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "merchandise_discount",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "original_total",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "shipping_discount",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "voucher_code",
                table: "orders");
        }
    }
}
