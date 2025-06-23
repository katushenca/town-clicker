namespace TownClicker.Models;

public class InventorySkin
{
    public int Id { get; set; }
    public int inventoryId { get; set; }
    public int skinId { get; set; }
    
    // new Fields
    public bool isImprovement { get; set; }
    public bool isImprovementUsed { get; set; }

    public DateTime? EndsAt { get; set; }
    public Inventory Inventory { get; set; }
    public Skin Skin { get; set; }
}