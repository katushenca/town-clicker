using System.ComponentModel.DataAnnotations;

namespace TownClicker.Models;

public class UserStatistics
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public long Money { get; set; }
    public long Clicks { get; set; }
    
    public User User { get; set; }
}