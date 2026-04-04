using System;
using System.Collections.Generic;

namespace ThstiServer.Models;

public partial class GalleryCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Gallery> Galleries { get; set; } = new List<Gallery>();
}
