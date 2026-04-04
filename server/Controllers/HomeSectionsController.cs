using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Text.Json;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/home-sections")]
    public class HomeSectionsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public HomeSectionsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetHomeSections()
        {
            try
            {
                var sections = await _context.HomeSections
                    .Where(s => s.IsActive)
                    .ToListAsync();

                // To conform to Node.js format where Metadata is JSON parsed
                var result = sections.Select(s => new
                {
                    s.Id,
                    s.SectionType,
                    s.Title,
                    s.Subtitle,
                    s.Description,
                    s.ImageUrl,
                    s.CtaText,
                    s.CtaLink,
                    s.IsActive,
                    s.UpdatedAt,
                    Metadata = string.IsNullOrEmpty(s.Metadata) ? null : JsonSerializer.Deserialize<object>(s.Metadata)
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch home sections" });
            }
        }

        [HttpGet("about")]
        public async Task<IActionResult> GetAboutSection()
        {
            try
            {
                var section = await _context.HomeSections
                    .FirstOrDefaultAsync(s => s.SectionType == "ABOUT" && s.IsActive);

                if (section == null) return NotFound(new { error = "Active ABOUT section not found" });

                var result = new
                {
                    section.Id,
                    section.SectionType,
                    section.Title,
                    section.Subtitle,
                    section.Description,
                    section.ImageUrl,
                    section.CtaText,
                    section.CtaLink,
                    section.IsActive,
                    section.UpdatedAt,
                    Metadata = string.IsNullOrEmpty(section.Metadata) ? null : JsonSerializer.Deserialize<object>(section.Metadata)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch about section" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{type}")]
        public async Task<IActionResult> UpdateHomeSection(string type, [FromBody] HomeSectionRequest req)
        {
            try
            {
                var typeStr = type.ToUpper();
                string[] validTypes = { "HERO", "ABOUT", "SERVICES", "NEWS", "GALLERY", "CONTACT", "LIFE_AT_THSTI" };
                if (!validTypes.Contains(typeStr))
                {
                    return BadRequest(new { error = "Invalid section type" });
                }

                string? metadataStr = null;
                if (req.Metadata != null)
                {
                    metadataStr = JsonSerializer.Serialize(req.Metadata);
                }

                var section = await _context.HomeSections.FirstOrDefaultAsync(s => s.SectionType == typeStr);

                if (section == null)
                {
                    section = new HomeSection
                    {
                        SectionType = typeStr,
                        Title = req.Title,
                        Subtitle = req.Subtitle,
                        Description = req.Description,
                        ImageUrl = req.ImageUrl,
                        CtaText = req.CtaText,
                        CtaLink = req.CtaLink,
                        Metadata = metadataStr,
                        IsActive = req.IsActive,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.HomeSections.Add(section);
                }
                else
                {
                    section.Title = req.Title;
                    section.Subtitle = req.Subtitle;
                    section.Description = req.Description;
                    section.ImageUrl = req.ImageUrl;
                    section.CtaText = req.CtaText;
                    section.CtaLink = req.CtaLink;
                    section.Metadata = metadataStr;
                    section.IsActive = req.IsActive;
                    section.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                var result = new
                {
                    section.Id,
                    section.SectionType,
                    section.Title,
                    section.Subtitle,
                    section.Description,
                    section.ImageUrl,
                    section.CtaText,
                    section.CtaLink,
                    section.IsActive,
                    section.UpdatedAt,
                    Metadata = string.IsNullOrEmpty(section.Metadata) ? null : JsonSerializer.Deserialize<object>(section.Metadata)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update home section" });
            }
        }
    }
}
