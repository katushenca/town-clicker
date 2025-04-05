using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class Inventory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public ICollection<InventorySkin> InventorySkins { get; set; }
}