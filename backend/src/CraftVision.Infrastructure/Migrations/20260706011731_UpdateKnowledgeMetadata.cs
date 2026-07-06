using System;
using System.Collections.Generic;
using CraftVision.Domain.Enums;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateKnowledgeMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:difficulty_enum", "Easy,Hard,Medium")
                .Annotation("Npgsql:Enum:file_type_enum", "Image")
                .Annotation("Npgsql:Enum:material_unit_enum", "gram,liter,meter,pack,piece,set")
                .Annotation("Npgsql:Enum:message_role_enum", "Assistant,System,User")
                .Annotation("Npgsql:Enum:option_level_enum", "Advanced,Basic,Intermediate")
                .Annotation("Npgsql:Enum:request_status_enum", "Completed,Failed,Pending")
                .Annotation("Npgsql:Enum:user_tier_enum", "Free,Premium")
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,")
                .Annotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.CreateTable(
                name: "knowledge_materials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: true),
                    current_price = table.Column<decimal>(type: "numeric", nullable: true),
                    unit = table.Column<MaterialUnit>(type: "material_unit_enum", nullable: true),
                    difficulty = table.Column<Difficulty>(type: "difficulty_enum", nullable: true),
                    occasion = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    purchase_url = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    last_checked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    embedding = table.Column<Vector>(type: "vector(1536)", nullable: true),
                    search_keywords = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_materials", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "knowledge_tutorials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: true),
                    difficulty = table.Column<Difficulty>(type: "difficulty_enum", nullable: true),
                    occasion = table.Column<string>(type: "text", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    embedding = table.Column<Vector>(type: "vector(1536)", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_knowledge_tutorials", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    tier = table.Column<UserTier>(type: "user_tier_enum", nullable: false),
                    auth_provider = table.Column<string>(type: "text", nullable: true),
                    provider_id = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ai_chat_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_active_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_chat_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_chat_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "uploaded_files",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_type = table.Column<FileType>(type: "file_type_enum", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_uploaded_files", x => x.id);
                    table.ForeignKey(
                        name: "fk_uploaded_files_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_quotas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    daily_requests_used = table.Column<int>(type: "integer", nullable: false),
                    daily_limit = table.Column<int>(type: "integer", nullable: false),
                    last_reset_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_quotas", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_quotas_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prompt_text = table.Column<string>(type: "text", nullable: false),
                    uploaded_file_id = table.Column<Guid>(type: "uuid", nullable: true),
                    parsed_intent = table.Column<string>(type: "jsonb", nullable: true),
                    request_tokens = table.Column<int>(type: "integer", nullable: true),
                    response_tokens = table.Column<int>(type: "integer", nullable: true),
                    total_tokens = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<RequestStatus>(type: "request_status_enum", nullable: false),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_requests_ai_chat_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "ai_chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ai_requests_uploaded_files_uploaded_file_id",
                        column: x => x.uploaded_file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_ai_requests_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "image_analysis_results",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    uploaded_file_id = table.Column<Guid>(type: "uuid", nullable: false),
                    detected_materials = table.Column<List<string>>(type: "text[]", nullable: true),
                    detected_colors = table.Column<List<string>>(type: "text[]", nullable: true),
                    detected_technique = table.Column<List<string>>(type: "text[]", nullable: true),
                    raw_vision_response = table.Column<string>(type: "text", nullable: true),
                    confidence_score = table.Column<decimal>(type: "numeric", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_image_analysis_results", x => x.id);
                    table.ForeignKey(
                        name: "fk_image_analysis_results_uploaded_files_uploaded_file_id",
                        column: x => x.uploaded_file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_chat_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: true),
                    role = table.Column<MessageRole>(type: "message_role_enum", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    image_file_id = table.Column<Guid>(type: "uuid", nullable: true),
                    retrieved_context_ids = table.Column<List<Guid>>(type: "uuid[]", nullable: true),
                    tokens_used = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_chat_messages", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_chat_messages_ai_chat_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "ai_chat_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ai_chat_messages_ai_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "ai_requests",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_ai_chat_messages_uploaded_files_image_file_id",
                        column: x => x.image_file_id,
                        principalTable: "uploaded_files",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "diy_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    occasion = table.Column<string>(type: "text", nullable: true),
                    option_level = table.Column<OptionLevel>(type: "option_level_enum", nullable: true),
                    difficulty = table.Column<Difficulty>(type: "difficulty_enum", nullable: true),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: true),
                    estimated_cost = table.Column<decimal>(type: "numeric", nullable: true),
                    materials_json = table.Column<string>(type: "jsonb", nullable: true),
                    steps_json = table.Column<string>(type: "jsonb", nullable: true),
                    share_slug = table.Column<string>(type: "text", nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_selected = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diy_plans", x => x.id);
                    table.ForeignKey(
                        name: "fk_diy_plans_ai_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "ai_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_diy_plans_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gift_suggestions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    difficulty = table.Column<Difficulty>(type: "difficulty_enum", nullable: true),
                    estimated_cost_range = table.Column<string>(type: "text", nullable: true),
                    estimated_time = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gift_suggestions", x => x.id);
                    table.ForeignKey(
                        name: "fk_gift_suggestions_ai_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "ai_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "diy_plan_materials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    diy_plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    material_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name_snapshot = table.Column<string>(type: "text", nullable: true),
                    price_snapshot = table.Column<decimal>(type: "numeric", nullable: true),
                    purchase_url_snapshot = table.Column<string>(type: "text", nullable: true),
                    quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    search_keywords_snapshot = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diy_plan_materials", x => x.id);
                    table.ForeignKey(
                        name: "fk_diy_plan_materials_diy_plans_diy_plan_id",
                        column: x => x.diy_plan_id,
                        principalTable: "diy_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_diy_plan_materials_knowledge_materials_material_id",
                        column: x => x.material_id,
                        principalTable: "knowledge_materials",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "diy_plan_tutorials",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    diy_plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tutorial_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_diy_plan_tutorials", x => x.id);
                    table.ForeignKey(
                        name: "fk_diy_plan_tutorials_diy_plans_diy_plan_id",
                        column: x => x.diy_plan_id,
                        principalTable: "diy_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_diy_plan_tutorials_knowledge_tutorials_tutorial_id",
                        column: x => x.tutorial_id,
                        principalTable: "knowledge_tutorials",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_messages_image_file_id",
                table: "ai_chat_messages",
                column: "image_file_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_messages_request_id",
                table: "ai_chat_messages",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_messages_session_id",
                table: "ai_chat_messages",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_sessions_user_id",
                table: "ai_chat_sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_requests_session_id",
                table: "ai_requests",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_requests_uploaded_file_id",
                table: "ai_requests",
                column: "uploaded_file_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_requests_user_id",
                table: "ai_requests",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_diy_plan_materials_diy_plan_id",
                table: "diy_plan_materials",
                column: "diy_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_diy_plan_materials_material_id",
                table: "diy_plan_materials",
                column: "material_id");

            migrationBuilder.CreateIndex(
                name: "ix_diy_plan_tutorials_diy_plan_id",
                table: "diy_plan_tutorials",
                column: "diy_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_diy_plan_tutorials_tutorial_id",
                table: "diy_plan_tutorials",
                column: "tutorial_id");

            migrationBuilder.CreateIndex(
                name: "ix_diy_plans_request_id",
                table: "diy_plans",
                column: "request_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_diy_plans_user_id",
                table: "diy_plans",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_gift_suggestions_request_id",
                table: "gift_suggestions",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "ix_image_analysis_results_uploaded_file_id",
                table: "image_analysis_results",
                column: "uploaded_file_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_materials_embedding",
                table: "knowledge_materials",
                column: "embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_knowledge_tutorials_embedding",
                table: "knowledge_tutorials",
                column: "embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_uploaded_files_user_id",
                table: "uploaded_files",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_quotas_user_id",
                table: "user_quotas",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_chat_messages");

            migrationBuilder.DropTable(
                name: "diy_plan_materials");

            migrationBuilder.DropTable(
                name: "diy_plan_tutorials");

            migrationBuilder.DropTable(
                name: "gift_suggestions");

            migrationBuilder.DropTable(
                name: "image_analysis_results");

            migrationBuilder.DropTable(
                name: "user_quotas");

            migrationBuilder.DropTable(
                name: "knowledge_materials");

            migrationBuilder.DropTable(
                name: "diy_plans");

            migrationBuilder.DropTable(
                name: "knowledge_tutorials");

            migrationBuilder.DropTable(
                name: "ai_requests");

            migrationBuilder.DropTable(
                name: "ai_chat_sessions");

            migrationBuilder.DropTable(
                name: "uploaded_files");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
