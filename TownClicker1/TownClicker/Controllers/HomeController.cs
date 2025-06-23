using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TownClicker.Models;

namespace TownClicker.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }


    [Authorize]
    public IActionResult Index()
    {
        if (HttpContext.Session.GetString("LastBoostTime") == null)
            HttpContext.Session.SetString("LastBoostTime", DateTime.UtcNow.ToString());
        return View();
    }
}