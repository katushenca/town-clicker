using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class Upgrade
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public double InitialCost { get; set; }
    public double CostMultiplier { get; set; }
    public EffectType EffectType { get; set; }
    public double EffectValue { get; set; }

    public ICollection<UserUpgrades> UserUpgrades { get; set; }
}

public enum EffectType
{
    None = 0,
    Flat = 1,
    Mult = 2
}
