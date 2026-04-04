using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class User
{
    public int Id { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Name { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int FailedLoginAttempts { get; set; }

    public bool ForcePasswordChange { get; set; }

    public bool IsActive { get; set; }

    public bool IsLocked { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime? LockedUntil { get; set; }

    public DateTime? PasswordUpdatedAt { get; set; }

    public string? Mobile { get; set; }

    public string Username { get; set; } = null!;

    public string Role { get; set; } = "VIEWER";

    public virtual ICollection<AuthAuditLog> AuthAuditLogs { get; set; } = new List<AuthAuditLog>();

    public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
