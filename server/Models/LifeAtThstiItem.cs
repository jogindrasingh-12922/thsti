using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class LifeAtThstiItem
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Category { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? ButtonText { get; set; }

    public string? ButtonLink { get; set; }

    public bool IsExternal { get; set; }

    public bool OpenInNewTab { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? Metadata { get; set; }
}
