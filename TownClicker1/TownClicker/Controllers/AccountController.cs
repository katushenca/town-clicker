using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TownClicker.Data;
using TownClicker.Models;
using TownClicker.ViewModels;

namespace TownClicker.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<User> userManager;
    private readonly SignInManager<User> signInManager;
    private readonly ApplicationDbContext _context;

    public AccountController(UserManager<User> userManager, SignInManager<User> signInManager,
        ApplicationDbContext context)
    {
        _context = context;
        this.userManager = userManager;
        this.signInManager = signInManager;
    }
    [HttpGet]
    public IActionResult Login()
    {
        var response = new LoginViewModel();
        return View(response);
    }

    [HttpPost] 
    public async Task<IActionResult> Login(LoginViewModel loginViewModel)
    {
        if (!ModelState.IsValid) return View(loginViewModel);
        var user = await userManager.FindByEmailAsync(loginViewModel.Email);

        if (user != null)
        {
            var passwordCheck = await userManager.CheckPasswordAsync(user, loginViewModel.Password);
            if (passwordCheck)
            {
                var result = await signInManager.PasswordSignInAsync(user, loginViewModel.Password, false, false);
                if (result.Succeeded)
                {
                    HttpContext.Session.SetString("LastBoostTime", DateTime.Now.ToString());
                    return RedirectToAction("Index", "Home");   
                }
            }
        }
        ModelState.AddModelError(string.Empty, "Неправильный логин или пароль");
        return View(loginViewModel);
    }
    
    [HttpGet]
    public IActionResult Register()
    {
        var response = new RegisterViewModel();
        return View(response);
    }

    [HttpPost]
    public async Task<IActionResult> Register(RegisterViewModel registerViewModel)
    {
        if (!ModelState.IsValid) return View(registerViewModel);
        
        var user = await userManager.FindByEmailAsync(registerViewModel.Email);
        if (user != null)
        {
            ModelState.AddModelError(string.Empty, "Пользователь с таким email уже создан");
            return View(registerViewModel);
        }
        var username = await userManager.FindByNameAsync(registerViewModel.Username);
        if (username != null)
        {
            ModelState.AddModelError(string.Empty, "Пользователь с таким именем уже создан");
            return View(registerViewModel);
        }

        var newUser = new User()
        {
            Email = registerViewModel.Email,
            UserName = registerViewModel.Username
        };
        var newUserResponse = await userManager.CreateAsync(newUser, registerViewModel.Password);
        if (newUserResponse.Succeeded)
        {
            await userManager.AddToRoleAsync(newUser, UserRoles.User);
            await _context.Inventories.AddAsync(new Inventory()
            {
                UserId = newUser.Id
            });
            await _context.UsersStatistics.AddAsync(new UserStatistics()
            {
                UserId = newUser.Id,
                Money = 0,
                Clicks = 0
            });
            await _context.SaveChangesAsync();
            return View("RegisterCompleted");
        }

        foreach (var error in newUserResponse.Errors)
        {
            ModelState.AddModelError(string.Empty, error.Description);
        }
        
        return View(registerViewModel);
    }

    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        HttpContext.Session.Clear();
        return RedirectToAction("Index", "Home");
    }
}