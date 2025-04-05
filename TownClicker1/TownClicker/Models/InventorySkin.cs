namespace TownClicker.Models;

public class InventorySkin
{
    public int inventoryId { get; set; }
    public int skinId { get; set; }
    
    public Inventory Inventory { get; set; }
    public Skin Skin { get; set; }
}