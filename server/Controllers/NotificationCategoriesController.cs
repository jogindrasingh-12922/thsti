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
    public class NotificationCategoriesController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public NotificationCategoriesController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/notifications/categories/public")]
        public async Task<IActionResult> GetPublicCategories()
        {
            try
            {
                var categories = await _context.NotificationCategories
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .ToListAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch notification categories" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpGet("api/notifications/categories")]
        public async Task<IActionResult> GetAllCategoriesAdmin()
        {
            try
            {
                var categories = await _context.NotificationCategories
                    .OrderBy(c => c.DisplayOrder)
                    .ToListAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch admin notification categories" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost("api/notifications/categories")]
        public async Task<IActionResult> CreateCategory([FromBody] NotificationCategoryRequest req)
        {
            try
            {
                var count = await _context.NotificationCategories.CountAsync();
                var category = new NotificationCategory
                {
                    Name = req.Name,
                    DisplayOrder = count,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.NotificationCategories.Add(category);
                await _context.SaveChangesAsync();

                return StatusCode(201, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create notification category" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("api/notifications/categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] NotificationCategoryRequest req)
        {
            try
            {
                var category = await _context.NotificationCategories.FindAsync(id);
                if (category == null) return NotFound(new { error = "Category not found" });

                if (!string.IsNullOrEmpty(req.Name)) category.Name = req.Name;
                if (req.DisplayOrder.HasValue) category.DisplayOrder = req.DisplayOrder.Value;
                if (req.IsActive.HasValue) category.IsActive = req.IsActive.Value;

                await _context.SaveChangesAsync();
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update notification category" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN")]
        [HttpDelete("api/notifications/categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.NotificationCategories.FindAsync(id);
                if (category == null) return NotFound(new { error = "Category not found" });

                _context.NotificationCategories.Remove(category);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete notification category" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPatch("api/notifications/categories/{id}/toggle")]
        public async Task<IActionResult> ToggleCategoryActive(int id)
        {
            try
            {
                var category = await _context.NotificationCategories.FindAsync(id);
                if (category == null) return NotFound(new { error = "Category not found" });

                category.IsActive = !category.IsActive;
                await _context.SaveChangesAsync();

                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to toggle notification category status" });
            }
        }
    }
}
