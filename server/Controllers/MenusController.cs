using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using ClosedXML.Excel;
using System.IO;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/menus")]
    public class MenusController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public MenusController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetActiveMenus([FromQuery] string? location)
        {
            var query = _context.Menus
                .Include(m => m.InverseParent.Where(s => s.IsActive && s.IsVisible).OrderBy(s => s.Order))
                    .ThenInclude(s => s.InverseParent.Where(s2 => s2.IsActive && s2.IsVisible).OrderBy(s2 => s2.Order))
                        .ThenInclude(s => s.InverseParent.Where(s3 => s3.IsActive && s3.IsVisible).OrderBy(s3 => s3.Order))
                .Where(m => m.IsActive && m.IsVisible && m.ParentId == null);

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(m => m.Location == location);
            }

            var menus = await query.OrderBy(m => m.Order).ToListAsync();
            return Ok(menus);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR,VIEWER")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllMenus(int page = 1, int limit = 10, string sort = "order", string direction = "asc", string search = "")
        {
            var query = _context.Menus.Include(m => m.Parent).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(m => m.Label.ToLower().Contains(lowerSearch) || 
                                         (m.Route != null && m.Route.ToLower().Contains(lowerSearch)) ||
                                         (m.Parent != null && m.Parent.Label.ToLower().Contains(lowerSearch)));
            }

            int total = await query.CountAsync();
            var skip = (page - 1) * limit;

            if (direction == "desc")
            {
                query = sort switch
                {
                    "label" => query.OrderByDescending(m => m.Label),
                    "route" => query.OrderByDescending(m => m.Route),
                    _ => query.OrderByDescending(m => m.Order)
                };
            }
            else
            {
                query = sort switch
                {
                    "label" => query.OrderBy(m => m.Label),
                    "route" => query.OrderBy(m => m.Route),
                    _ => query.OrderBy(m => m.Order)
                };
            }

            var menus = await query.Skip(skip).Take(limit).ToListAsync();

            return Ok(new
            {
                data = menus,
                meta = new { total, page, limit, totalPages = (int)Math.Ceiling(total / (double)limit) }
            });
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> CreateMenu([FromBody] MenuRequest req)
        {
            try
            {
                var menu = new Menu
                {
                    Label = req.Label,
                    Route = req.Route,
                    Order = req.Order,
                    IsActive = req.IsActive,
                    IsVisible = req.IsVisible,
                    IsExternal = req.IsExternal,
                    TargetBlank = req.TargetBlank,
                    ParentId = req.ParentId,
                    Location = req.Location ?? "HEADER",
                    IsMegaMenu = req.IsMegaMenu
                };

                _context.Menus.Add(menu);
                await _context.SaveChangesAsync();
                return StatusCode(201, menu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create menu" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateMenu(int id, [FromBody] MenuRequest req)
        {
            try
            {
                var menu = await _context.Menus.FindAsync(id);
                if (menu == null) return NotFound(new { error = "Menu not found" });

                menu.Label = req.Label;
                menu.Route = req.Route;
                menu.Order = req.Order;
                menu.IsActive = req.IsActive;
                menu.IsVisible = req.IsVisible;
                menu.IsExternal = req.IsExternal;
                menu.TargetBlank = req.TargetBlank;
                menu.ParentId = req.ParentId;
                menu.Location = req.Location ?? "HEADER";
                menu.IsMegaMenu = req.IsMegaMenu;

                await _context.SaveChangesAsync();
                return Ok(menu);
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to update menu" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null) return NotFound();

            _context.Menus.Remove(menu);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderMenus([FromBody] MenuReorderRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in req.OrderedIds)
                {
                    var menu = await _context.Menus.FindAsync(item.Id);
                    if (menu != null)
                    {
                        menu.Order = item.Order;
                    }
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Menus reordered successfully" });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Failed to reorder menus" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR,VIEWER")]
        [HttpGet("export")]
        public async Task<IActionResult> ExportMenus()
        {
            try
            {
                var allMenus = await _context.Menus.Include(m => m.Parent).OrderBy(m => m.Order).ThenBy(m => m.Id).ToListAsync();

                var sortedMenus = new List<Menu>();
                void BuildTree(int? parentId)
                {
                    var children = allMenus.Where(m => m.ParentId == parentId).ToList();
                    foreach (var child in children)
                    {
                        sortedMenus.Add(child);
                        BuildTree(child.Id);
                    }
                }
                BuildTree(null);

                var sortedIds = new HashSet<int>(sortedMenus.Select(m => m.Id));
                var orphans = allMenus.Where(m => !sortedIds.Contains(m.Id)).ToList();
                sortedMenus.AddRange(orphans);

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Menus");

                worksheet.Cell(1, 1).Value = "S.No";
                worksheet.Cell(1, 2).Value = "id";
                worksheet.Cell(1, 3).Value = "label";
                worksheet.Cell(1, 4).Value = "route";
                worksheet.Cell(1, 5).Value = "parentId";
                worksheet.Cell(1, 6).Value = "parentLabel";
                worksheet.Cell(1, 7).Value = "order";
                worksheet.Cell(1, 8).Value = "location";
                worksheet.Cell(1, 9).Value = "isActive";
                worksheet.Cell(1, 10).Value = "isVisible";
                worksheet.Cell(1, 11).Value = "isExternal";
                worksheet.Cell(1, 12).Value = "targetBlank";

                for (int i = 0; i < sortedMenus.Count; i++)
                {
                    var m = sortedMenus[i];
                    int row = i + 2;
                    worksheet.Cell(row, 1).Value = i + 1;
                    worksheet.Cell(row, 2).Value = m.Id;
                    worksheet.Cell(row, 3).Value = m.Label;
                    worksheet.Cell(row, 4).Value = m.Route ?? "";
                    worksheet.Cell(row, 5).Value = m.ParentId?.ToString() ?? "";
                    worksheet.Cell(row, 6).Value = m.Parent?.Label ?? "";
                    worksheet.Cell(row, 7).Value = m.Order;
                    worksheet.Cell(row, 8).Value = m.Location;
                    worksheet.Cell(row, 9).Value = m.IsActive;
                    worksheet.Cell(row, 10).Value = m.IsVisible;
                    worksheet.Cell(row, 11).Value = m.IsExternal;
                    worksheet.Cell(row, 12).Value = m.TargetBlank;
                }

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                var content = stream.ToArray();

                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "menus_export.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to export menus" });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPost("import")]
        public async Task<IActionResult> ImportMenus(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { error = "No file uploaded" });

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // skip header

                int imported = 0;
                foreach (var row in rows)
                {
                    var idCell = row.Cell(2).Value.ToString();
                    var label = row.Cell(3).Value.ToString();
                    if (string.IsNullOrEmpty(label)) continue;

                    var route = row.Cell(4).Value.ToString();
                    var parentIdCell = row.Cell(5).Value.ToString();
                    int.TryParse(row.Cell(7).Value.ToString(), out int order);
                    var location = row.Cell(8).Value.ToString();
                    bool.TryParse(row.Cell(9).Value.ToString(), out bool isActive);
                    bool.TryParse(row.Cell(10).Value.ToString(), out bool isVisible);
                    bool.TryParse(row.Cell(11).Value.ToString(), out bool isExternal);
                    bool.TryParse(row.Cell(12).Value.ToString(), out bool targetBlank);

                    int? parentId = int.TryParse(parentIdCell, out int pid) ? pid : null;

                    var payload = new Menu
                    {
                        Label = label,
                        Route = string.IsNullOrEmpty(route) ? null : route,
                        Order = order,
                        IsActive = isActive,
                        IsVisible = isVisible,
                        IsExternal = isExternal,
                        TargetBlank = targetBlank,
                        Location = string.IsNullOrEmpty(location) ? "HEADER" : location,
                        ParentId = parentId,
                        IsMegaMenu = false
                    };

                    if (int.TryParse(idCell, out int id) && id > 0)
                    {
                        var existing = await _context.Menus.FindAsync(id);
                        if (existing != null)
                        {
                            existing.Label = payload.Label;
                            existing.Route = payload.Route;
                            existing.Order = payload.Order;
                            existing.IsActive = payload.IsActive;
                            existing.IsVisible = payload.IsVisible;
                            existing.IsExternal = payload.IsExternal;
                            existing.TargetBlank = payload.TargetBlank;
                            existing.Location = payload.Location;
                            existing.ParentId = payload.ParentId;
                        }
                        else
                        {
                            // If ID doesn't exist but we want to seed identity
                            // Postgres doesn't naturally allow inserting into IDENTITY column unless we OVERRIDING SYSTEM VALUE
                            // For simplicity, we just add it and let DB generate new ID.
                            _context.Menus.Add(payload);
                        }
                    }
                    else
                    {
                        _context.Menus.Add(payload);
                    }
                    imported++;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Import successful", count = imported });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to import menus" });
            }
        }
        
        [Authorize(Roles = "SUPER_ADMIN")]
        [HttpPost("seed-defaults")]
        public async Task<IActionResult> SeedDefaultMenus()
        {
            if (await _context.Menus.AnyAsync())
            {
                return BadRequest(new { error = "Menus already seeded" });
            }
            
            var defaultMenus = new List<Menu>
            {
                new Menu { Label = "Home", Route = "/", Order = 1, IsExternal = false },
                new Menu { Label = "About", Route = "/javascript:void(0);", Order = 2, IsExternal = false },
                new Menu { Label = "Research and Innovation", Route = "/javascript:void(0);", Order = 3, IsExternal = false },
                new Menu { Label = "Academics", Route = "/javascript:void(0);", Order = 4, IsExternal = false },
                new Menu { Label = "Facilities", Route = "/javascript:void(0);", Order = 5, IsExternal = false },
                new Menu { Label = "Global Health", Route = "/javascript:void(0);", Order = 6, IsExternal = false }
            };
            
            _context.Menus.AddRange(defaultMenus);
            await _context.SaveChangesAsync();
            
            return StatusCode(201, new { message = "Default menus seeded successfully" });
        }
    }
}
