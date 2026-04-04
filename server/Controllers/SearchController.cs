using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System;
using System.Collections.Generic;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public SearchController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q))
            {
                return Ok(new List<object>());
            }

            var queryLower = q.ToLower();

            var pages = await _context.Pages
                .Where(p => p.IsActive && 
                           (p.Title.ToLower().Contains(queryLower) || 
                            p.Content.ToLower().Contains(queryLower)))
                .Select(p => new { p.Title, p.Slug, p.Content })
                .ToListAsync();

            var news = await _context.News
                .Where(n => n.IsActive && 
                           (n.Title.ToLower().Contains(queryLower) || 
                            n.Content.ToLower().Contains(queryLower)))
                .Select(n => new { n.Title, n.Slug, n.Content })
                .ToListAsync();

            var results = new List<object>();

            foreach (var p in pages)
            {
                results.Add(new
                {
                    type = "Page",
                    title = p.Title,
                    url = $"/pages/{p.Slug}",
                    snippet = GetSnippet(p.Content)
                });
            }

            foreach (var n in news)
            {
                results.Add(new
                {
                    type = "News",
                    title = n.Title,
                    url = $"/news/{n.Slug}",
                    snippet = GetSnippet(n.Content)
                });
            }

            return Ok(results);
        }

        private string GetSnippet(string content)
        {
            if (string.IsNullOrEmpty(content)) return "";
            var textOnly = Regex.Replace(content, "<[^>]+>", " ").Trim();
            return textOnly.Length > 150 ? textOnly.Substring(0, 150) + "..." : textOnly;
        }
    }
}
