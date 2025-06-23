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
                Name = "Маленький дом",
                Description = "Маленький дом",
                LevelRequired = 0,
                InitialCost = 20,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 1
            },
            new()
            {
                Id = 2,
                Name = "Средний дом",
                Description = "Средний дом",
                LevelRequired = 1,
                InitialCost = 250,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 5
            },
            new()
            {
                Id = 3,
                Name = "Большой дом",
                Description = "Большой дом",
                LevelRequired = 3,
                InitialCost = 25000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 8
            },
            new()
            {
                Id = 4,
                Name = "Маленькое здание",
                Description = "Маленькое здание",
                LevelRequired = 4,
                InitialCost = 500000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 32
            },
            new()
            {
                Id = 5,
                Name = "Среднее здание",
                Description = "Среднее здание",
                LevelRequired = 6,
                InitialCost = 10000000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 128
            },
            new()
            {
                Id = 6,
                Name = "Большое здание",
                Description = "Большое здание",
                LevelRequired = 8,
                InitialCost = 150000000,
                CostMultiplier = 1.5,
                EffectType = EffectType.Flat,
                EffectValue = 512
            },
            new()
            {
                Id = 7,
                Name = "Кафе",
                Description = "Кафе",
                LevelRequired = 2,
                InitialCost = 500,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.05
            },
            new()
            {
                Id = 8,
                Name = "Больница",
                Description = "Больница",
                LevelRequired = 3,
                InitialCost = 40000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.05
            },
            new()
            {
                Id = 9,
                Name = "Авто магазин",
                Description = "Авто магазин",
                LevelRequired = 4,
                InitialCost = 750000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.10
            },
            new()
            {
                Id = 10,
                Name = "Пожарная станция",
                Description = "Пожарная станция",
                LevelRequired = 5,
                InitialCost = 3000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.15
            },
            new()
            {
                Id = 11,
                Name = "Заправка",
                Description = "Заправка",
                LevelRequired = 6,
                InitialCost = 20000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.15
            },
            new()
            {
                Id = 12,
                Name = "Полицейский участок",
                Description = "Полицейский участок",
                LevelRequired = 7,
                InitialCost = 50000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.20
            },
            new()
            {
                Id = 13,
                Name = "Церковь",
                Description = "Церковь",
                LevelRequired = 9,
                InitialCost = 300000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.25
            },
            new()
            {
                Id = 14,
                Name = "Склад",
                Description = "Склад",
                LevelRequired = 10,
                InitialCost = 800000000,
                CostMultiplier = 10,
                EffectType = EffectType.Mult,
                EffectValue = 0.3
            }
        });
        context.SaveChanges();
    }
}
