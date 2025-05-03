using System.ComponentModel.DataAnnotations;

namespace TownClicker.ViewModels;

public class RegisterViewModel
{
    [Display(Name = "Email")]
    [Required(ErrorMessage = "Введите email")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }
    
    [Display(Name = "Имя пользователя")]
    [Required(ErrorMessage = "Введите имя пользователя")]
    public string Username { get; set; }
    
    [Display(Name = "Пароль")]
    [Required(ErrorMessage = "Введите пароль")]
    [DataType(DataType.Password)]
    public string Password { get; set; }
    
    [Display(Name = "Повторите пароль")]
    [Required(ErrorMessage = "Повторно введите пароль")]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Не совпадает с паролем")]
    public string ConfirmPassword { get; set; } 
}