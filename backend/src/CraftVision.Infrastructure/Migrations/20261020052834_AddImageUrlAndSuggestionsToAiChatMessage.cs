using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CraftVision.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlAndSuggestionsToAiChatMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_url",
                table: "ai_chat_messages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "suggestions_json",
                table: "ai_chat_messages",
                type: "text",
                nullable: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_url",
                table: "ai_chat_messages");

            migrationBuilder.DropColumn(
                name: "suggestions_json",
                table: "ai_chat_messages");
        }
    }
}
