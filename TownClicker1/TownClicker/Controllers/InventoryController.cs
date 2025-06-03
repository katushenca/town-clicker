using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
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
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        var inventory = await _context.Inventories.FirstAsync(i => i.UserId == userId);
        var inventoryId = inventory.Id;
        var items = await _context.InventorySkins
            .Where(i => i.inventoryId == inventoryId && i.isImprovement && !i.isImprovementUsed).Join(_context.Skins, 
                i => i.skinId, s => s.Id, (i, s) =>
            new {
                SkinId = s.Id,
                SkinName = s.Name,
                Url = s.ImageUrl
            })
            .ToListAsync();
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
        var currentImprovement = await _context.InventorySkins
            .FirstOrDefaultAsync(x => 
                x.inventoryId == inventory.Id && 
                x.skinId == SkinId && !x.isImprovementUsed);
        
        currentImprovement.isImprovementUsed = true;
        currentImprovement.EndsAt = DateTime.UtcNow.AddSeconds(duration);
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

    [HttpPost("/api/upgrade/add")]
    [Authorize]
    public async Task<IActionResult> AddUpgradeToInventory([FromBody] int skinId)
    {
        var username = User.Identity.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
        if (user == null)
            return NotFound(new { success = false, error = "Пользователь не найден" });
        var userId = user.Id;
        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.UserId == userId);
        if (inventory == null)
            return NotFound(new { success = false, error = "Инвентарь не найден" });
        var inventoryId = inventory.Id;
        var skin = await _context.Skins.FindAsync(skinId);
        if (skin == null)
            return NotFound(new { success = false, error = $"Скин не найден" });
        await _context.InventorySkins.AddAsync(new InventorySkin()
        {
            skinId = skinId,
            inventoryId = inventoryId,
            isImprovement = true
        });
        await _context.SaveChangesAsync();
        return Ok(new { success = true });
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