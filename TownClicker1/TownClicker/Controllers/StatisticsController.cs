using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TownClicker.Data;
using TownClicker.Models;

namespace TownClicker.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatisticsController(ApplicationDbContext context, UserManager<User> userManager) : Controller
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<User> _userManager = userManager;

    [HttpGet]
    public async Task<IActionResult> GetStatistics()
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new
        {
            userStatistics.Money,
            userStatistics.Clicks,
            userStatistics.Popularity
        });
    }
    
    // Получение количества кликов пользователя
    [HttpGet("clicks")]
    public async Task<IActionResult> GetClicks()
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new { userStatistics.Clicks });
    }
    
    [HttpPost]
    public async Task<IActionResult> UpdateStatistics([FromBody] StatisticsRequest request)
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Clicks += request.ClicksDiff;
        userStatistics.Money += request.MoneyDiff;
        await _context.SaveChangesAsync();
        
        return Ok(new { userStatistics.Clicks });
    }

    // Обновление количества кликов пользователя
    [HttpPost("clicks")]
    public async Task<IActionResult> UpdateClicks([FromBody] BalanceUpdateRequest request)
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Clicks += request.AmountChange;
        await _context.SaveChangesAsync();
        
        return Ok(new { userStatistics.Clicks });
    }

    // Получение баланса пользователя
    [HttpGet("money")]
    public async Task<IActionResult> GetBalance()
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        return Ok(new { userStatistics.Money });
    }

    // Обновление баланса пользователя
    [HttpPost("money")]
    public async Task<IActionResult> UpdateBalance([FromBody] BalanceUpdateRequest request)
    {
        var userId = _userManager.GetUserId(User)!;
        var userStatistics = await _context.UsersStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
        if (userStatistics == null)
            return NotFound("User statistics not found.");

        userStatistics.Money += request.AmountChange;
        await _context.SaveChangesAsync();
        
        return Ok(new { userStatistics.Money });
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