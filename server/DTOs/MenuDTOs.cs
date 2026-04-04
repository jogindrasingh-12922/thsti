using System.Collections.Generic;

namespace ThstiServer.DTOs
{
    public class MenuRequest
    {
        public string Label { get; set; } = string.Empty;
        public string? Route { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public bool IsVisible { get; set; }
        public bool IsExternal { get; set; }
        public bool TargetBlank { get; set; }
        public int? ParentId { get; set; }
        public string? Location { get; set; }
        public bool IsMegaMenu { get; set; }
    }

    public class MenuReorderItem
    {
        public int Id { get; set; }
        public int Order { get; set; }
    }

    public class MenuReorderRequest
    {
        public List<MenuReorderItem> OrderedIds { get; set; } = new List<MenuReorderItem>();
    }
}
