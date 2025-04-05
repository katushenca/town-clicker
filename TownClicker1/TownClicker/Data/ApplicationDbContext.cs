using Microsoft.EntityFrameworkCore;
using TownClicker.Models;

namespace TownClicker.Data;

public class ApplicationDbContext : DbContext
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
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }
}