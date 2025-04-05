using Microsoft.AspNetCore.Identity;
using TownClicker.Models;

namespace TownClicker.Data;

public class Seed
{
    public static void SeedData(IApplicationBuilder applicationBuilder)
        {
            using (var serviceScope = applicationBuilder.ApplicationServices.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetService<ApplicationDbContext>();
                var passwordHasher = new PasswordHasher<User>();
                
                context.Database.EnsureCreated();

                if (!context.Users.Any())
                {

                    var admin = new User
                    {
                        Id = 1,
                        Username = "admin"
                    };
                    admin.PasswordHash = passwordHasher.HashPassword(admin, "admin123");
                    context.Users.Add(admin);
                    var player = new User()
                    {
                        Id = 2,
                        Username = "player"
                    };
                    player.PasswordHash = passwordHasher.HashPassword(player, "player");
                    context.Users.Add(player);
                    context.SaveChanges();

                }
                if (!context.Inventories.Any())
                {
                    context.Inventories.AddRange(new List<Inventory>()
                    {
                        new Inventory()
                        {
                            Id = 1,
                            UserId = 1
                        },
                        new Inventory()
                        {
                            Id = 2,
                            UserId = 2
                        }
                    });
                    context.SaveChanges();
                }
                
                if (!context.Skins.Any())
                {
                    context.Skins.AddRange(new List<Skin>()
                    {
                        new Skin()
                        {
                            Id = 1,
                            Name = "Дом 1",
                            ImageUrl = ""
                        },
                        new Skin()
                        {
                            Id = 2,
                            Name = "Дом 2",
                            ImageUrl = ""
                        },
                        new Skin()
                        {
                            Id = 3,
                            Name = "Дом 3",
                            ImageUrl = ""
                        }
                    });
                    context.SaveChanges();
                }
                
                if (!context.InventorySkins.Any())
                {
                    context.InventorySkins.AddRange(new List<InventorySkin>()
                    {
                        new InventorySkin()
                        {
                            inventoryId = 1,
                            skinId = 2
                        },
                        new InventorySkin()
                        {
                            inventoryId = 1,
                            skinId = 1
                        },
                        new InventorySkin()
                        {
                            inventoryId = 2,
                            skinId = 3
                        }
                    });
                    context.SaveChanges();
                }
                
                if (!context.UsersStatistics.Any())
                {
                    context.UsersStatistics.AddRange(new List<UserStatistics>()
                    {
                        new UserStatistics()
                        {
                            Id = 1,
                            UserId = 1,
                            Money = 300,
                            Clicks = 21312
                        },
                        new UserStatistics()
                        {
                            Id = 2,
                            UserId = 2,
                            Money = 1000,
                            Clicks = 5000
                        }
                    });
                    context.SaveChanges();
                }
                
                if (!context.Upgrades.Any())
                {
                    context.Upgrades.AddRange(new List<Upgrade>()
                    {
                        new Upgrade { Id = 1, Name = "Новичок", Description = "самый маленький" },
                        new Upgrade { Id = 2, Name = "Профессионал", Description = "хорооош" },
                        new Upgrade { Id = 3, Name = "Бог", Description = "мастер игры" }
                    });
                    context.SaveChanges();
                }
                
                if (!context.UsersUpgrades.Any())
                {
                    var existingUserIds = context.Users.Select(u => u.Id).ToList();
                    var existingUpgradeIds = context.Upgrades.Select(u => u.Id).ToList();
    
                    context.UsersUpgrades.AddRange(new List<UserUpgrades>()
                    {
                        new UserUpgrades { UserId = 1, UpgradeId = 1, Level = 5 },
                        new UserUpgrades { UserId = 2, UpgradeId = 2, Level = 6 }
                    }.Where(u => 
                        existingUserIds.Contains(u.UserId) && 
                        existingUpgradeIds.Contains(u.UpgradeId))
                            .ToList());
    
                    context.SaveChanges();
                }
                
                

            }
        }
}