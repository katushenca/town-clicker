using System.ComponentModel.DataAnnotations;

namespace TownClicker.ViewModels;

public class RegisterViewModel
{
    [Display(Name = "Email Address")]
    [Required(ErrorMessage = "Введите email адрес")]
    public string Email { get; set; }
    [Display(Name = "Username")]
    [Required(ErrorMessage = "Введите Username")]
    public string Username { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; }
    [Display(Name = "Confirm Password")]
    [Required(ErrorMessage = "Confirm Password is required")]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Confirm Password does not match")]
    public string ConfirmPassword { get; set; } 
}