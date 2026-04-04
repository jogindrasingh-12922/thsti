using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/pages")]
    public class PagesController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public PagesController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet("public")]
        public async Task<IActionResult> GetActivePages()
        {
            var pages = await _context.Pages
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new { p.Id, p.Title, p.Slug, p.MetaTitle })
                .ToListAsync();
            return Ok(pages);
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetPageBySlug(string slug)
        {
            var page = await _context.Pages.FirstOrDefaultAsync(p => p.Slug == slug);
            if (page == null) return NotFound(new { error = "Page not found" });

            if (!page.IsActive)
            {
                // Optional: Check if user is authenticated
                if (!User.Identity?.IsAuthenticated ?? true)
                {
                    return StatusCode(403, new { error = "Access denied" });
                }
            }

            return Ok(page);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR,VIEWER")]
        [HttpGet]
        public async Task<IActionResult> GetPages()
        {
            var pages = await _context.Pages
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return Ok(pages);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> CreatePage([FromBody] PageRequest req)
        {
            var exists = await _context.Pages.AnyAsync(p => p.Slug == req.Slug);
            if (exists) return BadRequest(new { error = "Slug must be unique" });

            try
            {
                var page = new Page
                {
                    Title = req.Title,
                    Slug = req.Slug,
                    Content = req.Content,
                    OgImage = req.OgImage,
                    MetaTitle = req.MetaTitle,
                    MetaDescription = req.MetaDescription,
                    IsActive = req.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Pages.Add(page);
                await _context.SaveChangesAsync();
                return StatusCode(201, page);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to create page" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdatePage(int id, [FromBody] PageRequest req)
        {
            var page = await _context.Pages.FindAsync(id);
            if (page == null) return NotFound(new { error = "Page not found" });

            var slugExists = await _context.Pages.AnyAsync(p => p.Slug == req.Slug && p.Id != id);
            if (slugExists) return BadRequest(new { error = "Slug must be unique" });

            try
            {
                page.Title = req.Title;
                page.Slug = req.Slug;
                page.Content = req.Content;
                page.OgImage = req.OgImage;
                page.MetaTitle = req.MetaTitle;
                page.MetaDescription = req.MetaDescription;
                page.IsActive = req.IsActive;
                page.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(page);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to update page" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePage(int id)
        {
            var page = await _context.Pages.FindAsync(id);
            if (page == null) return NotFound();

            _context.Pages.Remove(page);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
