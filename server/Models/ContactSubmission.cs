using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class ContactSubmission
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string Message { get; set; } = null!;

    public bool IsResolved { get; set; }

    public DateTime CreatedAt { get; set; }
}
