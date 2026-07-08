using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAi3dRequestTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ai_3d_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    tripo_task_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    locked_by = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    locked_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    credit_cost = table.Column<int>(type: "integer", nullable: false),
                    uploaded_file_id = table.Column<Guid>(type: "uuid", nullable: true),
                    model_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    result_model_url = table.Column<string>(type: "text", nullable: true),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    progress = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_3d_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_3d_requests_uploaded_files_uploaded_file_id",
                        column: x => x.uploaded_file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_ai_3d_requests_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ai_3d_requests_idempotency_key",
                table: "ai_3d_requests",
                column: "idempotency_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ai_3d_requests_status_locked_until",
                table: "ai_3d_requests",
                columns: new[] { "status", "locked_until" },
                filter: "status IN ('queued', 'running')");

            migrationBuilder.CreateIndex(
                name: "ix_ai_3d_requests_tripo_task_id",
                table: "ai_3d_requests",
                column: "tripo_task_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ai_3d_requests_uploaded_file_id",
                table: "ai_3d_requests",
                column: "uploaded_file_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_3d_requests_user_id",
                table: "ai_3d_requests",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_3d_requests");
        }
    }
}
