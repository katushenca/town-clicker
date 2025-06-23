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
        var statistics = await _context.UsersStatistics.FirstAsync(i => i.UserId == user.Id);
        
        return Ok(new
        {
            id = user.Id,
            popularity = statistics.Popularity,
            clicks = statistics.Clicks
        });
    }
    
    [HttpGet("statistics/popularity")]
    public async Task<IActionResult> GetAllPopularityStatistics()
    {
        var topUsersByMoney = await _context.UsersStatistics
            .OrderByDescending(us => us.Popularity)
            .Take(10)
            .Select(stat => new
            {
                id = stat.User.Id,
                username = stat.User.UserName,
                data = stat.Popularity
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
                id = stat.User.Id,
                username = stat.User.UserName,
                data = stat.Clicks
            })
            .ToListAsync();
        return Ok(topUsersByClicks);
    }
}
