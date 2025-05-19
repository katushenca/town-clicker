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
    
    [HttpGet]
    public async Task<IActionResult> GetStatistics()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new
        {
            Clicks = userStatistics.Clicks,
            Coins = userStatistics.Money
        });
    }
    
    // Получение количества кликов пользователя
    [HttpGet("clicks")]
    public async Task<IActionResult> GetClicks()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new { Clicks = userStatistics.Clicks });
    }
    
    [HttpPost]
    public async Task<IActionResult> UpdateStatistics([FromBody] StatisticsRequest request)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Clicks += request.ClicksDiff;
        userStatistics.Money += request.MoneyDiff;
        await _context.SaveChangesAsync();
        
        return Ok(new { Clicks = userStatistics.Clicks });
    }

    // Обновление количества кликов пользователя
    [HttpPost("clicks")]
    public async Task<IActionResult> UpdateClicks([FromBody] BalanceUpdateRequest request)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Clicks += request.AmountChange;
        await _context.SaveChangesAsync();
        
        return Ok(new { Clicks = userStatistics.Clicks });
    }

    // Получение баланса пользователя
    [HttpGet("money")]
    public async Task<IActionResult> GetBalance()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new { Balance = userStatistics.Money });
    }

    // Обновление баланса пользователя
    [HttpPost("money")]
    public async Task<IActionResult> UpdateBalance([FromBody] BalanceUpdateRequest request)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == User.Identity.Name);
        if (user == null)
            return NotFound("User not found.");

        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Money += request.AmountChange;
        await _context.SaveChangesAsync();
        
        return Ok(new { Balance = userStatistics.Money });
    }
}

public class BalanceUpdateRequest
{
    public int AmountChange { get; set; }
}

public class StatisticsRequest
{
    public int MoneyDiff { get; set; }
    public int ClicksDiff { get; set; }
}