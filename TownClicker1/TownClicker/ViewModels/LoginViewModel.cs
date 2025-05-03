using System.ComponentModel.DataAnnotations;

namespace TownClicker.ViewModels;

public class LoginViewModel
{
    [Display(Name = "Email")]
    [Required(ErrorMessage = "Введите email")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }
    
    [Display(Name = "Пароль")]
    [Required(ErrorMessage = "Введите пароль")]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}