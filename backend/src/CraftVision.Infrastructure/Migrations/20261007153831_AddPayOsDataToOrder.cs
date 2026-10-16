using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayOsDataToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "pay_os_account_name",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pay_os_account_number",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pay_os_bin",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pay_os_checkout_url",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pay_os_qr_code",
                table: "orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "pay_os_account_name",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "pay_os_account_number",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "pay_os_bin",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "pay_os_checkout_url",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "pay_os_qr_code",
                table: "orders");
        }
    }
}
