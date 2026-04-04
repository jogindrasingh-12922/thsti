using System;

namespace ThstiServer.DTOs
{
    public class InternationalCollaborationRequest
    {
        public string Title { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public string? Link { get; set; }
        public bool? IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
