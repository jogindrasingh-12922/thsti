using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class HeroSlide
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string? Subtitle { get; set; }

    public string Type { get; set; } = null!;

    public string MediaUrl { get; set; } = null!;

    public string? PosterUrl { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }

    public bool IsActiveVideo { get; set; }

    public bool OpenInNewTab { get; set; }

    public string? RouteUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool ShowText { get; set; }
}
