using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class Upgrade
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    
    public ICollection<UserUpgrades> UserUpgrades { get; set; }
}