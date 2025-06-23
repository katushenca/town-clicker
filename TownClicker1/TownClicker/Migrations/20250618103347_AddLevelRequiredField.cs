using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddLevelRequiredField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LevelRequired",
                table: "Upgrades",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LevelRequired",
                table: "Upgrades");
        }
    }
}
