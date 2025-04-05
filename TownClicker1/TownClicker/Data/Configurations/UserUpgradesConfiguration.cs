using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class UserUpgradesConfiguration : IEntityTypeConfiguration<UserUpgrades>
{
    public void Configure(EntityTypeBuilder<UserUpgrades> builder)
    {
        builder.HasKey(u => new { u.UserId, u.UpgradeId });
        builder.Property(u => u.Level).HasDefaultValue(1);

        builder.HasOne(u => u.User)
            .WithMany(u => u.UserUpgrades)
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Upgrade)
            .WithMany(u => u.UserUpgrades)
            .HasForeignKey(u => u.UpgradeId)
            .OnDelete(DeleteBehavior.Cascade);
        
    }
}