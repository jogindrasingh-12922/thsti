using System.Collections.Generic;

namespace ThstiServer.DTOs
{
    public class HomeSectionRequest
    {
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? CtaText { get; set; }
        public string? CtaLink { get; set; }
        public bool IsActive { get; set; }
        // We will accept metadata as string or JsonElement. For simplicity, object then serialize.
        public object? Metadata { get; set; } 
    }
}
