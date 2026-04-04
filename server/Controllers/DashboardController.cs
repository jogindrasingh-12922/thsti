using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public DashboardController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var usersCount = await _context.Users.CountAsync();
            var facultyCount = await _context.Faculties.CountAsync();
            var pagesCount = await _context.Pages.CountAsync();
            var newsCount = await _context.News.CountAsync();

            return Ok(new
            {
                users = usersCount,
                faculty = facultyCount,
                pages = pagesCount,
                news = newsCount
            });
        }
    }
}
