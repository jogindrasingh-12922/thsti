using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class Medium
{
    public int Id { get; set; }

    public string Filename { get; set; } = null!;

    public string Url { get; set; } = null!;

    public string MimeType { get; set; } = null!;

    public int Size { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? AltText { get; set; }

    public string StoragePath { get; set; } = null!;
}
