using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class News
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Summary { get; set; }

    public string Content { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public DateTime PublishDate { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsFeatured { get; set; }
}
