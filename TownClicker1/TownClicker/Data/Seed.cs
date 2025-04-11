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
                
                if (!context.Inventories.Any())
                {
                    context.Inventories.AddRange(new List<Inventory>()
                    {
                        new Inventory()
                        {
                            Id = 1,
                            UserId = "d79fd03d-5cac-4d65-bf28-220ee823f954"
                        },
                        new Inventory()
                        {
                            Id = 2,
                            UserId = "7431b356-281c-485e-a63f-f7f1b856ac3c"
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
                            UserId = "d79fd03d-5cac-4d65-bf28-220ee823f954",
                            Money = 300,
                            Clicks = 21312
                        },
                        new UserStatistics()
                        {
                            Id = 2,
                            UserId = "7431b356-281c-485e-a63f-f7f1b856ac3c",
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
                        new UserUpgrades { UserId = "d79fd03d-5cac-4d65-bf28-220ee823f954", UpgradeId = 1, Level = 5 },
                        new UserUpgrades { UserId = "7431b356-281c-485e-a63f-f7f1b856ac3c", UpgradeId = 2, Level = 6 }
                    }.Where(u => 
                        existingUpgradeIds.Contains(u.UpgradeId))
                            .ToList());
    
                    context.SaveChanges();
                }
                
                

            }
        }
    
    public static async Task SeedUsersAndRolesAsync(IApplicationBuilder applicationBuilder)
        {
            using (var serviceScope = applicationBuilder.ApplicationServices.CreateScope())
            {
                //Roles
                var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                if (!await roleManager.RoleExistsAsync(UserRoles.Admin))
                    await roleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
                if (!await roleManager.RoleExistsAsync(UserRoles.User))
                    await roleManager.CreateAsync(new IdentityRole(UserRoles.User));

                //Users
                var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var adminUserEmail = "shutenko.katya@bk.ru";

                var adminUser = await userManager.FindByEmailAsync(adminUserEmail);
                if (adminUser == null)
                {
                    var newAdminUser = new User()
                    {
                        UserName = "admin",
                        Email = adminUserEmail,
                        EmailConfirmed = true,
                    };
                    await userManager.CreateAsync(newAdminUser, "Coding@1234?");
                    await userManager.AddToRoleAsync(newAdminUser, UserRoles.Admin);
                }

                string appUserEmail = "user@mail.ru";

                var appUser = await userManager.FindByEmailAsync(appUserEmail);
                if (appUser == null)
                {
                    var newAppUser = new User()
                    {
                        UserName = "player",
                        Email = appUserEmail,
                        EmailConfirmed = true,
                    };
                    await userManager.CreateAsync(newAppUser, "Coding@1234?");
                    await userManager.AddToRoleAsync(newAppUser, UserRoles.User);
                }
            }
        }
}