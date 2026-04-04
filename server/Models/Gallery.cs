using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class Gallery
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string ImageUrl { get; set; } = null!;

    public int? CategoryId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual GalleryCategory? Category { get; set; }
}
