using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TownClicker.Data;
using TownClicker.Models;

namespace TownClicker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly List<int> upgradeIds;

    public InventoryController(ApplicationDbContext context)
    {
        _context = context;
        upgradeIds = new List<int>() { 1, 2 };
    }

    [HttpGet("{userName}")]
    public async Task<IActionResult> GetUserInventory(string userName)
    {
        if (User.Identity is { IsAuthenticated: false })
            return Unauthorized();
        Console.WriteLine("лалла 1");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        Console.WriteLine("лалла 2" + userId);
        var inventory = await _context.Inventories.FirstAsync(i => i.UserId == userId);
        var inventoryId = inventory.Id;
        Console.WriteLine("инвентарь ид" + inventoryId);
        var items = await _context.InventorySkins
            .Where(i => i.inventoryId == inventoryId && i.isImprovement && !i.isImprovementUsed).Join(_context.Skins, 
                i => i.skinId, s => s.Id, (i, s) =>
            new {
                SkinId = s.Id,
                SkinName = s.Name,
                Url = s.ImageUrl
            })
            .ToListAsync();
        Console.WriteLine(items.Count);
        return Ok(items);
    }

    [HttpGet("{userName}/{SkinId}")]
    public async Task<IActionResult> UseImprovement(string userName, int SkinId)
    {
        if (User.Identity is { IsAuthenticated: false })
            return Unauthorized();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        var inventory = await _context.Inventories.FirstAsync(i => i.UserId == userId);
        var inventoryId = inventory.Id;
        var skin = await _context.Skins.FindAsync(SkinId);
        var duration = skin.DurationSeconds;
        var currentImprovement = new InventorySkin(){inventoryId = inventoryId, skinId = SkinId};
        _context.InventorySkins.Attach(currentImprovement);
        _context.Entry(currentImprovement).Property(x => x.isImprovementUsed).CurrentValue = true;
        _context.Entry(currentImprovement).Property(x => x.EndsAt).CurrentValue = DateTime.UtcNow.AddSeconds(duration);
        var improvementData = await _context.Skins.FindAsync(SkinId);
        await _context.SaveChangesAsync();
        var json = JsonSerializer.Serialize(new ImprovementData
        {
            Id = SkinId,
            InventoryId = inventoryId,
            Duration = duration,
            SkinName = skin.Name,
            EndsAt = DateTime.UtcNow.AddSeconds(duration),
            Image = improvementData.ImageUrl
        });
        HttpContext.Session.SetString("ActiveUpgrade", json);
        return Ok(new
        {
            Id = SkinId,
            InventoryId = inventoryId,
            Duration = duration,
            name = skin.Name,
            EndsAt = DateTime.UtcNow.AddSeconds(duration),
            Image = improvementData.ImageUrl
        });
    }
    
    [HttpGet("/api/upgrade/status")]
    public IActionResult GetUpgradeStatus()
    {
        var json = HttpContext.Session.GetString("ActiveUpgrade");
        if (json != null)
        {
            var upgrade = JsonSerializer.Deserialize<ImprovementData>(json);
            if (upgrade.EndsAt > DateTime.UtcNow)
            {
                return Ok(new
                {
                    isActive = true,
                    remaining = (int)(upgrade.EndsAt - DateTime.UtcNow).TotalSeconds,
                    upgrade.Id,
                    upgrade.EndsAt,
                    upgrade.Image,
                    name = upgrade.SkinName,
                });
            }
        }
        return Ok(new { isActive = false });
    }

    [HttpGet("/api/upgrade/get")]
    public async Task<IActionResult> GetUpgrade()
    {
        var lastBoostTime = HttpContext.Session.GetString("LastBoostTime");
        Console.WriteLine(lastBoostTime + " овфлв");
        DateTime lastBoost;
        if (!DateTime.TryParse(lastBoostTime, out lastBoost))
        {
            lastBoost = DateTime.UtcNow;
        }
        if ((DateTime.UtcNow - lastBoost).TotalMinutes >= 1)
        {
            var upgradesCount = upgradeIds.Count;
            var random = new Random();
            var randomIndex = random.Next(0, upgradesCount);
            var upgrade = upgradeIds[randomIndex];
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
            var userId = user.Id;
            var inventory = await _context.Inventories.FirstAsync(i => i.UserId == userId);
            var inventoryId = inventory.Id;
            var currentUpgrade = _context.InventorySkins.FindAsync(inventoryId, upgrade);
            if (currentUpgrade == null || currentUpgrade.Result == null)
            {
                _context.InventorySkins.Add(new InventorySkin()
                {
                    isImprovement = true,
                    inventoryId = inventoryId,
                    skinId = upgrade
                });
                HttpContext.Session.SetString("LastBoostTime", DateTime.UtcNow.ToString());
            }
            else
            {
                if (!currentUpgrade.Result.isImprovementUsed)
                    HttpContext.Session.SetString("LastBoostTime", DateTime.UtcNow.ToString());
                currentUpgrade.Result.isImprovementUsed = false;
                currentUpgrade.Result.EndsAt = DateTime.UtcNow.AddSeconds(60);
                _context.InventorySkins.Update(currentUpgrade.Result);
            }
            
            await _context.SaveChangesAsync();
            return Ok();
        }
        return BadRequest();
    }
}

public class ImprovementData
{
    public int Id { get; set; }
    public int InventoryId { get; set; }
    public int Duration { get; set; }
    public string SkinName { get; set; }
    public DateTime EndsAt { get; set; }
    public string Image { get; set; }
}