using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/seed-defaults")]
    public class SeedController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public SeedController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpPost("design6")]
        public async Task<IActionResult> SeedDesign6()
        {
            try
            {
                // Alter table to convert from enum to varchar to avoid PostgreSQL enum issues completely
                await _context.Database.ExecuteSqlRawAsync("ALTER TABLE \"HomeSection\" ALTER COLUMN \"sectionType\" TYPE varchar(255) USING \"sectionType\"::text;");

                // 1. Seed Home Sections
                var sections = new List<HomeSection>
                {
                    new HomeSection
                    {
                        SectionType = "SERVICES",
                        Title = "Research & Innovation",
                        Subtitle = "Highlights of our academic and research excellence",
                        Description = "",
                        IsActive = true,
                        Metadata = JsonSerializer.Serialize(new[] 
                        {
                            new { icon = "fa-microscope", title = "Life Sciences", description = "Advanced research in life sciences." },
                            new { icon = "fa-dna", title = "Genetics", description = "Pioneering genetics and molecular biology." }
                        })
                    },
                    new HomeSection
                    {
                        SectionType = "NEWS",
                        Title = "News & Announcements",
                        Subtitle = "Latest updates from THSTI",
                        IsActive = true
                    },
                    new HomeSection
                    {
                        SectionType = "GALLERY",
                        Title = "Our Gallery",
                        Subtitle = "A glimpse into THSTI life",
                        IsActive = true
                    },
                    new HomeSection
                    {
                        SectionType = "CONTACT",
                        Title = "Contact Us",
                        Subtitle = "Get in touch with THSTI",
                        IsActive = true
                    },
                    new HomeSection
                    {
                        SectionType = "LIFE_AT_THSTI",
                        Title = "Life at THSTI",
                        Subtitle = "Experience the culture and environment",
                        IsActive = true
                    }
                };

                foreach (var section in sections)
                {
                    var existing = await _context.HomeSections.FirstOrDefaultAsync(s => s.SectionType == section.SectionType);
                    if (existing == null)
                    {
                        _context.HomeSections.Add(section);
                    }
                }

                // 2. Seed Pages
                var pages = new List<Page>
                {
                    new Page { Title = "Mission and Vision", Slug = "mission-and-vision", Content = "<p>THSTI is a society registered under the Societies Registration Act XXI of 1860.</p><h2>Our Mission</h2><p>To integrate the fields of medicine, science, engineering and technology into translational knowledge...</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Director's Message", Slug = "directors-message", Content = "<p>Welcome to Translational Health Science and Technology Institute.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Former Directors", Slug = "former-directors", Content = "<p>List of former directors.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Annual Reports", Slug = "annual-reports", Content = "<p>Annual consolidated reports for THSTI.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Society", Slug = "society", Content = "<p>Details about the Society and its members.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Governing Body", Slug = "governing-body", Content = "<p>Information regarding the THSTI Governing Body.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "THSTI Committees", Slug = "committees", Content = "<p>Various committees governing THSTI operations.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "RAP-SAC", Slug = "rap-sac", Content = "<p>Research Advisory Panel and Scientific Advisory Committee details.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "DBT-THSTI MoU", Slug = "mou", Content = "<p>Details regarding the Memorandum of Understanding.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Page { Title = "Documentary", Slug = "documentary", Content = "<p>THSTI Documentary video and details.</p>", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                };

                foreach (var page in pages)
                {
                    var existing = await _context.Pages.FirstOrDefaultAsync(p => p.Slug == page.Slug);
                    if (existing == null)
                    {
                        _context.Pages.Add(page);
                    }
                }

                await _context.SaveChangesAsync();

                // 3. Seed Menus (Linking properly)
                var aboutMenu = await _context.Menus.FirstOrDefaultAsync(m => m.Label == "ABOUT US");
                if (aboutMenu == null)
                {
                    aboutMenu = new Menu { Label = "ABOUT US", Route = "javascript:void(0);", IsActive = true, IsVisible = true, Order = 1, Location = "HEADER", IsMegaMenu = true };
                    _context.Menus.Add(aboutMenu);
                    await _context.SaveChangesAsync();
                }

                var subMenus = new List<Menu>
                {
                    new Menu { Label = "Mission and Vision", Route = "/page/mission-and-vision", ParentId = aboutMenu.Id, Order = 1, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "Director's Message", Route = "/page/directors-message", ParentId = aboutMenu.Id, Order = 2, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "Former Directors", Route = "/page/former-directors", ParentId = aboutMenu.Id, Order = 3, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "Annual Reports", Route = "/page/annual-reports", ParentId = aboutMenu.Id, Order = 4, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "Documentary", Route = "/page/documentary", ParentId = aboutMenu.Id, Order = 5, IsActive = true, IsVisible = true, Location = "HEADER" }
                };

                foreach (var sub in subMenus)
                {
                    var exists = await _context.Menus.AnyAsync(m => m.Label == sub.Label && m.ParentId == sub.ParentId);
                    if (!exists)
                    {
                        _context.Menus.Add(sub);
                    }
                }

                var rAndRMenu = await _context.Menus.FirstOrDefaultAsync(m => m.Label == "RESEARCH & INNOVATION");
                if (rAndRMenu == null)
                {
                    rAndRMenu = new Menu { Label = "RESEARCH & INNOVATION", Route = "javascript:void(0);", IsActive = true, IsVisible = true, Order = 2, Location = "HEADER", IsMegaMenu = true };
                    _context.Menus.Add(rAndRMenu);
                    await _context.SaveChangesAsync();
                }

                var docMenu = await _context.Menus.FirstOrDefaultAsync(m => m.Label == "Important Documents" && m.ParentId == aboutMenu.Id);
                if (docMenu == null)
                {
                    docMenu = new Menu { Label = "Important Documents", Route = "javascript:void(0);", ParentId = aboutMenu.Id, Order = 6, IsActive = true, IsVisible = true, Location = "HEADER" };
                    _context.Menus.Add(docMenu);
                    await _context.SaveChangesAsync();
                }

                var docSubMenus = new List<Menu>
                {
                    new Menu { Label = "Society", Route = "/page/society", ParentId = docMenu.Id, Order = 1, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "Governing Body", Route = "/page/governing-body", ParentId = docMenu.Id, Order = 2, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "THSTI Committees", Route = "/page/committees", ParentId = docMenu.Id, Order = 3, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "RAP-SAC", Route = "/page/rap-sac", ParentId = docMenu.Id, Order = 4, IsActive = true, IsVisible = true, Location = "HEADER" },
                    new Menu { Label = "DBT-THSTI MoU", Route = "/page/mou", ParentId = docMenu.Id, Order = 5, IsActive = true, IsVisible = true, Location = "HEADER" }
                };

                foreach (var sub in docSubMenus)
                {
                    var exists = await _context.Menus.AnyAsync(m => m.Label == sub.Label && m.ParentId == sub.ParentId);
                    if (!exists)
                    {
                        _context.Menus.Add(sub);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Seeded HomeSections, Pages and Nested Menus configurations natively in .NET based on Design 6." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to seed design reference in .NET", details = ex.Message });
            }
        }
    }
}
