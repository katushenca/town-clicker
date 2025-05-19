using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddUpgradeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "CostMultiplier",
                table: "Upgrades",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "EffectType",
                table: "Upgrades",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "EffectValue",
                table: "Upgrades",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "InitialCost",
                table: "Upgrades",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostMultiplier",
                table: "Upgrades");

            migrationBuilder.DropColumn(
                name: "EffectType",
                table: "Upgrades");

            migrationBuilder.DropColumn(
                name: "EffectValue",
                table: "Upgrades");

            migrationBuilder.DropColumn(
                name: "InitialCost",
                table: "Upgrades");
        }
    }
}
