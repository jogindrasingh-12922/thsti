using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class Programme
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? ShortDescription { get; set; }

    public string? ImageUrl { get; set; }

    public string? RouteUrl { get; set; }

    public bool IsExternal { get; set; }

    public bool OpenInNewTab { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
