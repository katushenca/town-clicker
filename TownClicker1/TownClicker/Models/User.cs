using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class User : IdentityUser
{
    public UserStatistics UserStatistics { get; set; }
    public ICollection<UserUpgrades> UserUpgrades { get; set; } = new List<UserUpgrades>();
    
    public Inventory Inventory { get; set; }
}
