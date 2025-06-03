using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddInventorySkinId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_InventorySkins",
                table: "InventorySkins");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "InventorySkins",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_InventorySkins",
                table: "InventorySkins",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_InventorySkins_inventoryId",
                table: "InventorySkins",
                column: "inventoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_InventorySkins",
                table: "InventorySkins");

            migrationBuilder.DropIndex(
                name: "IX_InventorySkins_inventoryId",
                table: "InventorySkins");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "InventorySkins");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InventorySkins",
                table: "InventorySkins",
                columns: new[] { "inventoryId", "skinId" });
        }
    }
}
