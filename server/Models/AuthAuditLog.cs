using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class AuthAuditLog
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? Ip { get; set; }

    public string? UserAgent { get; set; }

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? User { get; set; }
}
