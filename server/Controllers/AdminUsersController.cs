using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;
using BCrypt.Net;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "SUPER_ADMIN")]
    public class AdminUsersController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public AdminUsersController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Email, u.Name, u.Username, u.Role, u.IsActive, u.CreatedAt })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserRequest req)
        {
            if (await _context.Users.AnyAsync(u => u.Email == req.Email))
                return BadRequest(new { error = "Email already in use" });

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(req.Password ?? "thsti@123");

            var user = new User
            {
                Email = req.Email,
                Username = req.Email,
                Password = hashedPassword,
                Name = req.Name ?? "Admin User",
                Role = req.Role,
                IsActive = req.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return StatusCode(201, new { user.Id, user.Email, user.Role });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserRequest req)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (user.Email != req.Email && await _context.Users.AnyAsync(u => u.Email == req.Email))
                return BadRequest(new { error = "Email already in use" });

            user.Email = req.Email;
            user.Username = req.Email;
            user.Name = req.Name ?? "Admin User";
            user.Role = req.Role;
            user.IsActive = req.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(req.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(req.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(new { user.Id, user.Email, user.Role });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UserRequest
    {
        public string Email { get; set; } = null!;
        public string? Password { get; set; }
        public string? Name { get; set; }
        public string Role { get; set; } = "EDITOR";
        public bool IsActive { get; set; } = true;
    }
}
