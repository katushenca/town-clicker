using System.ComponentModel.DataAnnotations;

namespace TownClicker.Models;

public class UserUpgrades
{
    public string UserId { get; set; }
    public int UpgradeId { get; set; }
    public int Level { get; set; }
    public User User { get; set; }
    
    public Upgrade Upgrade { get; set; }
}