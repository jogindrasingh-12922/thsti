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
    [Route("api/research-centers")]
    public class ResearchCentersController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public ResearchCentersController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetResearchCenters()
        {
            var centers = await _context.ResearchCenters
                .Where(rc => rc.IsActive)
                .OrderBy(rc => rc.DisplayOrder)
                .ToListAsync();

            return Ok(new
            {
                sectionTitle = "Research Centers",
                items = centers
            });
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllResearchCenters()
        {
            var centers = await _context.ResearchCenters
                .OrderBy(rc => rc.DisplayOrder)
                .ToListAsync();
            return Ok(centers);
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetResearchCenterBySlug(string slug)
        {
            var center = await _context.ResearchCenters.FirstOrDefaultAsync(rc => rc.Slug == slug);
            if (center == null) return NotFound(new { error = "Research center not found" });

            return Ok(center);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> CreateResearchCenter([FromBody] ResearchCenterRequest req)
        {
            var routeUrl = req.RouteUrl;
            if (!req.IsExternal && string.IsNullOrWhiteSpace(routeUrl))
            {
                routeUrl = $"/research-centers/{req.Slug}";
            }

            var existing = await _context.ResearchCenters.AnyAsync(rc => rc.Slug == req.Slug);
            if (existing) return BadRequest(new { error = "Slug must be unique" });

            try
            {
                var center = new ResearchCenter
                {
                    Title = req.Title,
                    Slug = req.Slug,
                    Excerpt = req.Excerpt,
                    Content = req.Content,
                    ImageUrl = req.ImageUrl,
                    RouteUrl = routeUrl,
                    IsExternal = req.IsExternal,
                    OpenInNewTab = req.OpenInNewTab,
                    DisplayOrder = req.DisplayOrder,
                    IsActive = req.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ResearchCenters.Add(center);
                await _context.SaveChangesAsync();
                return StatusCode(201, center);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create research center", details = ex.Message });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateResearchCenter(int id, [FromBody] ResearchCenterRequest req)
        {
            var center = await _context.ResearchCenters.FindAsync(id);
            if (center == null) return NotFound(new { error = "Research center not found" });

            var routeUrl = req.RouteUrl;
            if (!req.IsExternal && string.IsNullOrWhiteSpace(routeUrl))
            {
                routeUrl = $"/research-centers/{req.Slug}";
            }

            var slugExists = await _context.ResearchCenters.AnyAsync(rc => rc.Slug == req.Slug && rc.Id != id);
            if (slugExists) return BadRequest(new { error = "Slug must be unique" });

            try
            {
                center.Title = req.Title;
                center.Slug = req.Slug;
                center.Excerpt = req.Excerpt;
                center.Content = req.Content;
                center.ImageUrl = req.ImageUrl;
                center.RouteUrl = routeUrl;
                center.IsExternal = req.IsExternal;
                center.OpenInNewTab = req.OpenInNewTab;
                center.DisplayOrder = req.DisplayOrder;
                center.IsActive = req.IsActive;
                center.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(center);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update research center", details = ex.Message });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPatch("{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleResearchCenterActive(int id)
        {
            var center = await _context.ResearchCenters.FindAsync(id);
            if (center == null) return NotFound(new { error = "Not found" });

            try
            {
                center.IsActive = !center.IsActive;
                await _context.SaveChangesAsync();
                return Ok(center);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to toggle status" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderResearchCenters([FromBody] GenericReorderRequest req)
        {
            if (req.Orders == null || !req.Orders.Any())
            {
                return BadRequest(new { error = "Invalid payload format. Expected { orders: [{ id, displayOrder }] }" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in req.Orders)
                {
                    var center = await _context.ResearchCenters.FindAsync(item.Id);
                    if (center != null)
                    {
                        center.DisplayOrder = item.DisplayOrder;
                    }
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Order updated successfully" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Failed to reorder research centers", details = ex.Message });
            }
        }
    }
}
