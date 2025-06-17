using Microsoft.EntityFrameworkCore;
using TownClicker.Models;

namespace TownClicker.Data;

public class UpgradesSeed
{
    public static void Seed(IApplicationBuilder applicationBuilder, bool force = false)
    {
        using var scope = applicationBuilder.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
        if (context.Upgrades.Any() && !force)
            return;
        context.Upgrades.RemoveRange(context.Upgrades);
        context.Upgrades.AddRange(new List<Upgrade>()
        {
            new()
            {
                Id = 1,
                Name = "Building 1",
                Description = "Building 1",
                LevelRequired = 0,
                InitialCost = 25,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 1
            },
            new()
            {
                Id = 2,
                Name = "Building 2",
                Description = "Building 2",
                LevelRequired = 1,
                InitialCost = 500,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 5
            },
            new()
            {
                Id = 3,
                Name = "Building 3",
                Description = "Building 3",
                LevelRequired = 3,
                InitialCost = 20000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 8
            },
            new()
            {
                Id = 4,
                Name = "Building 4",
                Description = "Building 4",
                LevelRequired = 4,
                InitialCost = 500000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 32
            },
            new()
            {
                Id = 5,
                Name = "Building 3",
                Description = "Building 3",
                LevelRequired = 5,
                InitialCost = 2000000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 128
            },
            new()
            {
                Id = 6,
                Name = "Building 3",
                Description = "Building 3",
                LevelRequired = 7,
                InitialCost = 50000000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 512
            },
            new()
            {
                Id = 7,
                Name = "Building 7",
                Description = "Building 7",
                LevelRequired = 2,
                InitialCost = 250,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.02
            },
            new()
            {
                Id = 8,
                Name = "Building 8",
                Description = "Building 8",
                LevelRequired = 3,
                InitialCost = 10000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.03
            },
            new()
            {
                Id = 9,
                Name = "Building 9",
                Description = "Building 9",
                LevelRequired = 4,
                InitialCost = 50000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.02
            },
            new()
            {
                Id = 10,
                Name = "Building 10",
                Description = "Building 10",
                LevelRequired = 6,
                InitialCost = 750000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.03
            },
            new()
            {
                Id = 11,
                Name = "Building 11",
                Description = "Building 11",
                LevelRequired = 7,
                InitialCost = 5000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.04
            },
            new()
            {
                Id = 12,
                Name = "Building 12",
                Description = "Building 12",
                LevelRequired = 8,
                InitialCost = 25000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.02
            },
            new()
            {
                Id = 13,
                Name = "Building 13",
                Description = "Building 13",
                LevelRequired = 9,
                InitialCost = 75000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.05
            },
            new()
            {
                Id = 14,
                Name = "Building 14",
                Description = "Building 14",
                LevelRequired = 10,
                InitialCost = 1000000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.1
            }
        });
        context.SaveChanges();
    }
}
