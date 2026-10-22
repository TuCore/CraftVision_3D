using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RecordDigitalCardOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "card_id",
                table: "orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "card_template_slug",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "order_kind",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "Product");

            migrationBuilder.CreateIndex(
                name: "ix_orders_card_id",
                table: "orders",
                column: "card_id",
                unique: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_orders_card_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "card_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "card_template_slug",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "order_kind",
                table: "orders");
        }
    }
}
