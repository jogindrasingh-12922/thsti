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
    [Route("api/contact")]
    public class ContactSubmissionsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public ContactSubmissionsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.ContactSubmissions
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.ContactSubmissions.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ContactSubmission item)
        {
            item.CreatedAt = DateTime.UtcNow;
            
            _context.ContactSubmissions.Add(item);
            await _context.SaveChangesAsync();
            return StatusCode(201, item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ContactSubmission updatedItem)
        {
            var item = await _context.ContactSubmissions.FindAsync(id);
            if (item == null) return NotFound();

            _context.Entry(item).CurrentValues.SetValues(updatedItem);
            item.Id = id; 
            

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.ContactSubmissions.FindAsync(id);
            if (item == null) return NotFound();

            _context.ContactSubmissions.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
