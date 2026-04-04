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
    public class InternationalCollaborationsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public InternationalCollaborationsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/international-collaboration/public")]
        public async Task<IActionResult> GetPublicCollaborations()
        {
            try
            {
                var items = await _context.InternationalCollaborations
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .ThenByDescending(c => c.CreatedAt)
                    .ToListAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch international collaborations" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpGet("api/international-collaboration")]
        public async Task<IActionResult> GetAllCollaborations()
        {
            try
            {
                var items = await _context.InternationalCollaborations
                    .OrderBy(c => c.DisplayOrder)
                    .ThenByDescending(c => c.CreatedAt)
                    .ToListAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch all international collaborations" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost("api/international-collaboration")]
        public async Task<IActionResult> CreateCollaboration([FromBody] InternationalCollaborationRequest req)
        {
            try
            {
                var item = new InternationalCollaboration
                {
                    Title = req.Title,
                    ImageUrl = req.ImageUrl,
                    Link = req.Link,
                    IsActive = req.IsActive ?? true,
                    DisplayOrder = req.DisplayOrder ?? 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.InternationalCollaborations.Add(item);
                await _context.SaveChangesAsync();

                return StatusCode(201, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create international collaboration" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("api/international-collaboration/{id}")]
        public async Task<IActionResult> UpdateCollaboration(int id, [FromBody] InternationalCollaborationRequest req)
        {
            try
            {
                var item = await _context.InternationalCollaborations.FindAsync(id);
                if (item == null) return NotFound(new { error = "Collaboration not found" });

                if (!string.IsNullOrEmpty(req.Title)) item.Title = req.Title;
                item.ImageUrl = req.ImageUrl; // Can be nulled out intentionally
                item.Link = req.Link;
                if (req.IsActive.HasValue) item.IsActive = req.IsActive.Value;
                if (req.DisplayOrder.HasValue) item.DisplayOrder = req.DisplayOrder.Value;
                
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update international collaboration" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN")]
        [HttpDelete("api/international-collaboration/{id}")]
        public async Task<IActionResult> DeleteCollaboration(int id)
        {
            try
            {
                var item = await _context.InternationalCollaborations.FindAsync(id);
                if (item == null) return NotFound(new { error = "Collaboration not found" });

                _context.InternationalCollaborations.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Collaboration deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete international collaboration" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPatch("api/international-collaboration/{id}/toggle-active")]
        public async Task<IActionResult> ToggleCollaborationActive(int id)
        {
            try
            {
                var item = await _context.InternationalCollaborations.FindAsync(id);
                if (item == null) return NotFound(new { error = "Collaboration not found" });

                item.IsActive = !item.IsActive;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to toggle status" });
            }
        }
    }
}
