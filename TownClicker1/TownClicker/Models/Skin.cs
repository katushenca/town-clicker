using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace TownClicker.Models;

public class Skin
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ImageUrl { get; set; }
    public int DurationSeconds { get; set; }
    public ICollection<InventorySkin> InventorySkins { get; set; }
}