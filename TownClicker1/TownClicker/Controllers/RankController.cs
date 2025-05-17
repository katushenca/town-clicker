using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TownClicker.Data;
using TownClicker.Models;

namespace TownClicker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RankController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RankController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("statistics/{userName}")]
    public async Task<IActionResult> GetUserStatistics(string userName)
    {
        if (User.Identity is { IsAuthenticated: false })
            return Unauthorized();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        var statistics = await _context.UsersStatistics.FirstAsync(i => i.UserId == userId);
        return Ok(new
        {
            userName,
            statistics.Money,
            statistics.Clicks
        });
    }
    
    [HttpGet("statistics/money")]
    public async Task<IActionResult> GetAllMoneyStatistics()
    {
        var topUsersByMoney = await _context.UsersStatistics
            .OrderByDescending(us => us.Money)
            .Take(10)
            .Select(stat => new
            {
                username = stat.User.UserName,
                data = stat.Money,
            })
            .ToListAsync();
        return Ok(topUsersByMoney);
    }
    
    [HttpGet("statistics/clicks")]
    public async Task<IActionResult> GetAllClicksStatistics()
    {
        var topUsersByClicks = await _context.UsersStatistics
            .OrderByDescending(us => us.Clicks)
            .Take(10)
            .Select(stat => new
            {
                username = stat.User.UserName,
                data = stat.Clicks
            })
            .ToListAsync();
        return Ok(topUsersByClicks);
    }
}
