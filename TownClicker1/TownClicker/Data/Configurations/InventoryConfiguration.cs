using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.HasKey(u => u.Id);

        builder.HasOne(u => u.User)
            .WithOne(u => u.Inventory)
            .HasForeignKey<Inventory>(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(u => u.InventorySkins)
            .WithOne(us => us.Inventory)
            .HasForeignKey(us => us.inventoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}