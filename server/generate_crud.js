const fs = require('fs');
const path = require('path');

const models = [
    { name: 'ContactSubmission', route: 'contact', hasSlug: false, hasReorder: false },
    { name: 'FooterLink', route: 'footer-links', hasSlug: false, hasReorder: true },
    { name: 'PreFooterLink', route: 'pre-footer-links', hasSlug: false, hasReorder: true },
    { name: 'Gallery', route: 'gallery', hasSlug: false, hasReorder: false },
    { name: 'LifeAtThstiItem', route: 'life-at-thsti', hasSlug: false, hasReorder: true },
    { name: 'MarqueeItem', route: 'marquee', hasSlug: false, hasReorder: true },
    { name: 'News', route: 'news', hasSlug: true, hasReorder: false },
    { name: 'Programme', route: 'programmes', hasSlug: true, hasReorder: true },
    { name: 'ResearchFacility', route: 'research-facilities', hasSlug: true, hasReorder: true },
    { name: 'TranslationLanguage', route: 'translation-languages', hasSlug: false, hasReorder: true }
];

const basePath = path.join(__dirname, 'Controllers');

models.forEach(m => {
    let namePlural = m.name === 'Gallery' ? 'Galleries' : (m.name === 'ResearchFacility' ? 'ResearchFacilities' : (m.name === 'News' ? 'News' : m.name + 's'));
    let namePluralDbSet = m.name === 'Gallery' ? 'Galleries' : (m.name === 'ResearchFacility' ? 'ResearchFacilities' : (m.name === 'News' ? 'News' : m.name + 's'));
    
    let code = `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/${m.route}")]
    public class ${namePlural}Controller : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public ${namePlural}Controller(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.${namePluralDbSet}
                ${m.hasReorder ? '.OrderBy(x => x.DisplayOrder).ToListAsync();' : '.ToListAsync();'}
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.${namePluralDbSet}.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ${m.name} item)
        {
            item.CreatedAt = DateTime.UtcNow;
            ${m.name !== 'ContactSubmission' && m.name !== 'TranslationLanguage' && m.name !== 'GalleryCategory' ? 'item.UpdatedAt = DateTime.UtcNow;' : ''}
            _context.${namePluralDbSet}.Add(item);
            await _context.SaveChangesAsync();
            return StatusCode(201, item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ${m.name} updatedItem)
        {
            var item = await _context.${namePluralDbSet}.FindAsync(id);
            if (item == null) return NotFound();

            _context.Entry(item).CurrentValues.SetValues(updatedItem);
            item.Id = id; 
            ${m.name !== 'ContactSubmission' && m.name !== 'TranslationLanguage' && m.name !== 'GalleryCategory' ? 'item.UpdatedAt = DateTime.UtcNow;' : ''}

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.${namePluralDbSet}.FindAsync(id);
            if (item == null) return NotFound();

            _context.${namePluralDbSet}.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
`;

    if (m.hasSlug) {
        code += `
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var item = await _context.${namePluralDbSet}.FirstOrDefaultAsync(x => x.Slug == slug);
            if (item == null) return NotFound();
            return Ok(item);
        }
`;
    }

    if (m.hasReorder) {
        code += `
        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("reorder")]
        public async Task<IActionResult> Reorder([FromBody] ThstiServer.DTOs.ReorderRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var order in req.Orders)
                {
                    var item = await _context.${namePluralDbSet}.FindAsync(order.Id);
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
`;
    }

    code += `
    }
}
`;
    fs.writeFileSync(path.join(basePath, namePlural + 'Controller.cs'), code);
});
console.log('Controllers generated.');
