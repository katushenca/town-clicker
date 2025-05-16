using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TownClicker.Data;
using TownClicker.Models;
using TownClicker.ViewModels;
using System.Text.Json;

namespace TownClicker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticsController : Controller
{
    private readonly ApplicationDbContext _context;

    public StatisticsController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("{userName}")]
    public async Task<IActionResult> GetStatistics(string userName)
    {
        if (User.Identity is { IsAuthenticated: false })
            return Unauthorized();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        var userStatistics = await _context.UsersStatistics.FirstAsync(s => s.UserId == userId);
        return Ok(userStatistics.Clicks);
    }
    
    [HttpPost("{userName}")]
    public async Task<IActionResult> UpdateStatistics(string userName, [FromBody] BalanceUpdateRequest request)
    {
        if (User.Identity is { IsAuthenticated: false })
            return Unauthorized();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
        var userId = user.Id;
        var userStatistics = await _context.UsersStatistics.FirstAsync(s => s.UserId == userId);
        userStatistics.Clicks += request.AmountChange;
        await _context.SaveChangesAsync();
        
        return Ok(userStatistics.Clicks);
    }
}

public class BalanceUpdateRequest
{
    public int AmountChange { get; set; }
}