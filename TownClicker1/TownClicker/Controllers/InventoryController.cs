using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TownClicker.Data;

namespace TownClicker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InventoryController(ApplicationDbContext context)
    {
        _context = context;
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
            .Where(i => i.inventoryId == inventoryId).Join(_context.Skins, 
                i => i.skinId, s => s.Id, (i, s) =>
            new {
                SkinId = s.Id,
                SkinName = s.Name,
                Url = s.ImageUrl
            })
            .ToListAsync();
        return Ok(items);
    }
}