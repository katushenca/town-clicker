using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TownClicker.Models;

namespace TownClicker.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    { 
        builder.Property(u => u.Id).ValueGeneratedNever();
        builder.Property(u => u.UserName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.PasswordHash).IsRequired();
        
         builder.HasOne(u => u.UserStatistics)
            .WithOne(us => us.User)
            .HasForeignKey<UserStatistics>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

         builder.HasMany(u => u.UserUpgrades)
             .WithOne(up => up.User)
             .HasForeignKey(up => up.UserId)
             .OnDelete(DeleteBehavior.Cascade);
    }
}