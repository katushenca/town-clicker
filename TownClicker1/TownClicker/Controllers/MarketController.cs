using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
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

    [HttpGet("upgrades")]
    public IActionResult MarketUpgrades()
    {
        return Ok(_context.Upgrades
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.InitialCost,
                u.CostMultiplier,
                EffectType = u.EffectType.ToString(),
                u.EffectValue
            }));
    }

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
        var userId = _userManager.GetUserId(User)!;
        var stats = _context.UsersStatistics.FirstOrDefault(u => u.UserId == userId);
        if (stats == null)
            return NotFound("Stats not found");
        var upgrades = _context.Upgrades.ToDictionary(u => u.Id);
        var currentUpgrade = upgrades.GetValueOrDefault(upgradeId);
        if (currentUpgrade == null)
            return NotFound("Upgrade not found");
        var userUpgrades = _context.UsersUpgrades.Where(uu => uu.UserId == userId).ToDictionary(uu => uu.UpgradeId);
        var currentUserUpgrade = userUpgrades.GetValueOrDefault(upgradeId);
        var level = currentUserUpgrade?.Level ?? 0;
        var cost = (long)(currentUpgrade.InitialCost * Math.Pow(currentUpgrade.CostMultiplier, level));
        if (stats.Money < cost)
            return BadRequest("Not enough money");
        if (currentUserUpgrade == null)
        {
            var newUpgrade = new UserUpgrades
            {
                UserId = userId,
                UpgradeId = upgradeId,
                Level = 1
            };
            _context.UsersUpgrades.Add(newUpgrade);
            userUpgrades.Add(upgradeId, newUpgrade);
        }
        else
            currentUserUpgrade.Level++;

        var popularity = 0d;
        foreach (var upgrade in upgrades.Where(u => u.Value.EffectType == EffectType.Flat))
            if (userUpgrades.TryGetValue(upgrade.Key, out var userUpgrade))
                popularity += upgrade.Value.EffectValue * userUpgrade.Level;
        foreach (var upgrade in upgrades.Where(u => u.Value.EffectType == EffectType.Mult))
            if (userUpgrades.TryGetValue(upgrade.Key, out var userUpgrade))
                popularity *= 1 + upgrade.Value.EffectValue * userUpgrade.Level;

        var popularityValue = (long)Math.Ceiling(popularity);
        stats.Money -= cost;
        stats.Popularity = popularityValue;
        _context.SaveChanges();
        return Ok(new { stats.Money, Popularity = popularityValue });
    }
}
