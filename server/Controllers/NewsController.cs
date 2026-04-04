using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/news")]
    public class NewsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public NewsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.News
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] News item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            _context.News.Add(item);
            await _context.SaveChangesAsync();
            return StatusCode(201, item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] News updatedItem)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();

            _context.Entry(item).CurrentValues.SetValues(updatedItem);
            item.Id = id; 
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();

            _context.News.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var item = await _context.News.FirstOrDefaultAsync(x => x.Slug == slug);
            if (item == null) return NotFound();
            return Ok(item);
        }

    }
}
