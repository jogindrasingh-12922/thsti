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
    public class NotificationsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public NotificationsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/notifications")]
        public async Task<IActionResult> GetPublicNotifications([FromQuery] string? type)
        {
            try
            {
                var query = _context.Notifications.Where(n => n.IsActive);
                
                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(n => n.Type == type);
                }

                var items = await query
                    .OrderBy(n => n.DisplayOrder)
                    .ThenByDescending(n => n.PublishDate)
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch notifications" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpGet("api/notifications/all")]
        public async Task<IActionResult> GetAllNotifications([FromQuery] string? type)
        {
            try
            {
                var query = _context.Notifications.AsQueryable();

                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(n => n.Type == type);
                }

                var items = await query
                    .OrderBy(n => n.Type)
                    .ThenBy(n => n.DisplayOrder)
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to fetch all notifications" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost("api/notifications")]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationRequest req)
        {
            try
            {
                var item = new Notification
                {
                    Title = req.Title,
                    Summary = req.Summary,
                    ImageUrl = req.ImageUrl,
                    Url = req.Url,
                    ButtonText = req.ButtonText,
                    OpenInNewTab = req.OpenInNewTab ?? false,
                    Type = string.IsNullOrEmpty(req.Type) ? "ANNOUNCEMENT" : req.Type,
                    PublishDate = req.PublishDate ?? DateTime.UtcNow,
                    DisplayOrder = req.DisplayOrder ?? 0,
                    IsActive = req.IsActive ?? false,
                    IsNew = req.IsNew ?? false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(item);
                await _context.SaveChangesAsync();

                return StatusCode(201, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create notification" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("api/notifications/{id}")]
        public async Task<IActionResult> UpdateNotification(int id, [FromBody] NotificationRequest req)
        {
            try
            {
                var item = await _context.Notifications.FindAsync(id);
                if (item == null) return NotFound(new { error = "Notification not found" });

                item.Title = req.Title;
                item.Summary = req.Summary;
                item.ImageUrl = req.ImageUrl;
                item.Url = req.Url;
                item.ButtonText = req.ButtonText;
                item.OpenInNewTab = req.OpenInNewTab ?? false;
                item.Type = string.IsNullOrEmpty(req.Type) ? "ANNOUNCEMENT" : req.Type;
                
                if (req.PublishDate.HasValue) item.PublishDate = req.PublishDate.Value;
                if (req.DisplayOrder.HasValue) item.DisplayOrder = req.DisplayOrder.Value;
                if (req.IsActive.HasValue) item.IsActive = req.IsActive.Value;
                if (req.IsNew.HasValue) item.IsNew = req.IsNew.Value;
                
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update notification" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN")]
        [HttpDelete("api/notifications/{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var item = await _context.Notifications.FindAsync(id);
                if (item == null) return NotFound(new { error = "Notification not found" });

                _context.Notifications.Remove(item);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to delete notification" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPatch("api/notifications/{id}/toggle-active")]
        public async Task<IActionResult> ToggleNotificationActive(int id)
        {
            try
            {
                var item = await _context.Notifications.FindAsync(id);
                if (item == null) return NotFound(new { error = "Notification not found" });

                item.IsActive = !item.IsActive;
                item.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to toggle notification" });
            }
        }
    }
}
