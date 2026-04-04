using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class Page
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? MetaTitle { get; set; }

    public string? MetaDescription { get; set; }

    public string? OgImage { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
