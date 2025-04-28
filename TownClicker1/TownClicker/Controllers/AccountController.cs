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
                    return RedirectToAction("Index", "Home");   
                }
            }
            TempData["Error"] = "Неправильный логин или пароль";
            return View(loginViewModel);
        }
        TempData["Error"] = "Неправильный логин или пароль";
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
            TempData["Error"] = "Пользователь с таким email уже создан";
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
        return RedirectToAction("Index", "Home");
    }
}