using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class SkinConfiguration : IEntityTypeConfiguration<Skin>
{
    public void Configure(EntityTypeBuilder<Skin> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Name).IsRequired().HasMaxLength(50);
        builder.Property(u => u.ImageUrl);

        builder.HasMany(u => u.InventorySkins)
            .WithOne(ui => ui.Skin)
            .HasForeignKey(us => us.skinId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}