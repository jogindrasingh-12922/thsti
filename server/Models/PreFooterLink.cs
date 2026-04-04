using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class PreFooterLink
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Url { get; set; }

    public string? ImageUrl { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }

    public bool OpenInNewTab { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
