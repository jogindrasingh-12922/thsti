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
    [Route("api/research-facilities")]
    public class ResearchFacilitiesController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public ResearchFacilitiesController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.ResearchFacilities
                .OrderBy(x => x.DisplayOrder).ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.ResearchFacilities.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ResearchFacility item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            _context.ResearchFacilities.Add(item);
            await _context.SaveChangesAsync();
            return StatusCode(201, item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ResearchFacility updatedItem)
        {
            var item = await _context.ResearchFacilities.FindAsync(id);
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
            var item = await _context.ResearchFacilities.FindAsync(id);
            if (item == null) return NotFound();

            _context.ResearchFacilities.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var item = await _context.ResearchFacilities.FirstOrDefaultAsync(x => x.Slug == slug);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("reorder")]
        public async Task<IActionResult> Reorder([FromBody] ThstiServer.DTOs.GenericReorderRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var order in req.Orders)
                {
                    var item = await _context.ResearchFacilities.FindAsync(order.Id);
                    if (item != null) item.DisplayOrder = order.DisplayOrder;
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Reordered successfully" });
            }
            catch(Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Failed to reorder" });
            }
        }

    }
}
