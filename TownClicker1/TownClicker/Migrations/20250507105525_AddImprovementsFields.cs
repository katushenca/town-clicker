using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddImprovementsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isImprovment",
                table: "InventorySkins",
                newName: "isImprovement");

            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "Skins",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndsAt",
                table: "InventorySkins",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "Skins");

            migrationBuilder.DropColumn(
                name: "EndsAt",
                table: "InventorySkins");

            migrationBuilder.RenameColumn(
                name: "isImprovement",
                table: "InventorySkins",
                newName: "isImprovment");
        }
    }
}
