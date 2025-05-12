using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class InventorySkinConfiguration : IEntityTypeConfiguration<InventorySkin>
{
    public void Configure(EntityTypeBuilder<InventorySkin> builder)
    {
        builder.HasKey(u => new { u.inventoryId, u.skinId });
    }
}