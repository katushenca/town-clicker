using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class AddPopulationField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Popularity",
                table: "UsersStatistics",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Popularity",
                table: "UsersStatistics");
        }
    }
}
