using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TownClicker.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDeleteBehaviorToCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_Users_UserId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_InventorySkins_Inventories_inventoryId",
                table: "InventorySkins");

            migrationBuilder.DropForeignKey(
                name: "FK_InventorySkins_Skins_skinId",
                table: "InventorySkins");

            migrationBuilder.DropForeignKey(
                name: "FK_UsersUpgrades_Users_UserId",
                table: "UsersUpgrades");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_Users_UserId",
                table: "Inventories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventorySkins_Inventories_inventoryId",
                table: "InventorySkins",
                column: "inventoryId",
                principalTable: "Inventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventorySkins_Skins_skinId",
                table: "InventorySkins",
                column: "skinId",
                principalTable: "Skins",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UsersUpgrades_Users_UserId",
                table: "UsersUpgrades",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_Users_UserId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_InventorySkins_Inventories_inventoryId",
                table: "InventorySkins");

            migrationBuilder.DropForeignKey(
                name: "FK_InventorySkins_Skins_skinId",
                table: "InventorySkins");

            migrationBuilder.DropForeignKey(
                name: "FK_UsersUpgrades_Users_UserId",
                table: "UsersUpgrades");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_Users_UserId",
                table: "Inventories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InventorySkins_Inventories_inventoryId",
                table: "InventorySkins",
                column: "inventoryId",
                principalTable: "Inventories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InventorySkins_Skins_skinId",
                table: "InventorySkins",
                column: "skinId",
                principalTable: "Skins",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UsersUpgrades_Users_UserId",
                table: "UsersUpgrades",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
