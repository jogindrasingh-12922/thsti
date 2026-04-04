using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class InternationalCollaboration
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public string? Link { get; set; }

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
