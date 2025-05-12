using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class UpgradeConfiguration : IEntityTypeConfiguration<Upgrade>
{
    public void Configure(EntityTypeBuilder<Upgrade> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Name).IsRequired().HasMaxLength(50);
        builder.Property(u => u.Description);
    }
}