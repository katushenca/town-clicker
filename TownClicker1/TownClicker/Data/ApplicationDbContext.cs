using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using TownClicker.Models;

namespace TownClicker.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Skin> Skins { get; set; }
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<UserStatistics> UsersStatistics { get; set; }
    public DbSet<UserUpgrades> UsersUpgrades { get; set; }
    public DbSet<Upgrade> Upgrades { get; set; }
    public DbSet<InventorySkin> InventorySkins { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }
}