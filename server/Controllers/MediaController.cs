using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/media")]
    public class MediaController : ControllerBase
    {
        private readonly ThstiDbContext _context;
        private readonly IWebHostEnvironment _env;

        public MediaController(ThstiDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadMedia([FromForm] IFormFile file, [FromForm] string? altText)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No file uploaded or invalid file format" });

            try
            {
                var uploadDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "uploads"));
                
                if (!Directory.Exists(uploadDir))
                    Directory.CreateDirectory(uploadDir);

                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var media = new Medium
                {
                    Filename = file.FileName,
                    Url = $"/uploads/{fileName}",
                    StoragePath = filePath,
                    MimeType = file.ContentType,
                    Size = (int)file.Length,
                    AltText = altText,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Media.Add(media);
                await _context.SaveChangesAsync();

                return StatusCode(201, media);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to upload media", details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMedia()
        {
            var media = await _context.Media.OrderByDescending(m => m.CreatedAt).ToListAsync();
            return Ok(media);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMedia(int id)
        {
            var media = await _context.Media.FindAsync(id);
            if (media == null) return NotFound(new { error = "Media not found" });

            try
            {
                if (System.IO.File.Exists(media.StoragePath))
                {
                    System.IO.File.Delete(media.StoragePath);
                }
            }
            catch { /* Ignore */ }

            _context.Media.Remove(media);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
