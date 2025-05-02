using System.ComponentModel.DataAnnotations;

namespace TownClicker.ViewModels;

public class LoginViewModel
{
    [Display(Name = "Email Address")]
    [Required(ErrorMessage = "Введите email адрес")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}