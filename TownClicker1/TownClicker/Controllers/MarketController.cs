using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TownClicker.Data;
using TownClicker.Models;

namespace TownClicker.Controllers;

[Authorize]
[Route("market")]
public class MarketController(ApplicationDbContext context, UserManager<User> userManager) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<User> _userManager = userManager;

    [HttpGet]
    public IActionResult Market()
    {
        var userId = _userManager.GetUserId(User)!;
        return Ok(_context.UsersUpgrades.Where(u => u.UserId == userId)
            .Select(uu => new
            {
                uu.UpgradeId,
                uu.Level
            }));
    }

    [HttpPost]
    public IActionResult MarketUpgrade(int upgradeId)
    {
        // TODO: ensure?
        var userId = _userManager.GetUserId(User)!;
        var upgrade = _context.UsersUpgrades.FirstOrDefault(u => u.UserId == userId && u.UpgradeId == upgradeId);
        if (upgrade == null)
        {
            if (!_context.Upgrades.Any(u => u.Id == upgradeId))
            {
                if (upgradeId is < 1 or > 13)
                    return NotFound("Upgrade not found");

                _context.Upgrades.Add(new Upgrade
                {
                    Id = upgradeId,
                    Name = $"Building {upgradeId}",
                    Description = $"Building {upgradeId}"
                });
            }

            _context.UsersUpgrades.Add(new UserUpgrades
            {
                UserId = userId,
                UpgradeId = upgradeId,
                Level = 1
            });
        }
        else
            upgrade.Level++;
        _context.SaveChanges();
        return Ok();
    }
}
