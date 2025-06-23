using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddProductFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isImprovementUsed",
                table: "InventorySkins",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "isImprovment",
                table: "InventorySkins",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isImprovementUsed",
                table: "InventorySkins");

            migrationBuilder.DropColumn(
                name: "isImprovment",
                table: "InventorySkins");
        }
    }
}
