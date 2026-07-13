using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "row_version",
                table: "products",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[] { 0 },
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "row_version",
                table: "products",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldDefaultValue: new byte[] { 0 });
        }
    }
}
