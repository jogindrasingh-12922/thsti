namespace ThstiServer.DTOs
{
    public class HeroSlideRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Type { get; set; }
        public string? MediaUrl { get; set; }
        public string? PosterUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public bool IsActiveVideo { get; set; }
        public bool OpenInNewTab { get; set; }
        public string? RouteUrl { get; set; }
        public bool ShowText { get; set; } = true;
    }

    public class ReorderItem
    {
        public int Id { get; set; }
        public int Order { get; set; }
    }

    public class ReorderRequest
    {
        public List<ReorderItem> Items { get; set; } = new List<ReorderItem>();
    }
}
