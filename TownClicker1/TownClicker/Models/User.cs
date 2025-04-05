using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    
    public UserStatistics UserStatistics { get; set; }
    public ICollection<UserUpgrades> UserUpgrades { get; set; } = new List<UserUpgrades>();
    
    public Inventory Inventory { get; set; }
}
