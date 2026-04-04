using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class NotificationCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }
}
