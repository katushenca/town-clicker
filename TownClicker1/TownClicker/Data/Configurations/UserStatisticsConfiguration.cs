using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class UserStatisticsConfiguration : IEntityTypeConfiguration<UserStatistics>
{
    public void Configure(EntityTypeBuilder<UserStatistics> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.UserId).IsRequired();
        builder.Property(u => u.Money).HasDefaultValue(0);
        builder.Property(u => u.Clicks).HasDefaultValue(0);
        
    }
}