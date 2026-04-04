using System;

namespace ThstiServer.DTOs
{
    public class NotificationCategoryRequest
    {
        public string Name { get; set; } = null!;
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
    }

    public class NotificationRequest
    {
        public string Title { get; set; } = null!;
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
        public string? Url { get; set; }
        public string? ButtonText { get; set; }
        public bool? OpenInNewTab { get; set; }
        public string? Type { get; set; }
        public DateTime? PublishDate { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsNew { get; set; }
    }
}
