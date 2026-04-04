using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ThstiDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ThstiDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { success = false, message = "Email and password are required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !user.IsActive)
                return Unauthorized(new { success = false, message = "Invalid credentials." });

            if (user.IsLocked && user.LockedUntil > DateTime.UtcNow)
                return StatusCode(423, new { success = false, message = "Account is locked." });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.IsLocked = true;
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(15);
                }
                await _context.SaveChangesAsync();
                return Unauthorized(new { success = false, message = "Invalid credentials." });
            }

            user.FailedLoginAttempts = 0;
            user.IsLocked = false;
            user.LockedUntil = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecret = _config["JWT_SECRET"] ?? "supersecret_thsticms_key_at_least_32_chars_long!!";
            var key = Encoding.ASCII.GetBytes(jwtSecret);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("userId", user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role ?? "VIEWER")
                }),
                Expires = DateTime.UtcNow.AddMinutes(15),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new LoginResponse
            {
                Success = true,
                AccessToken = jwt,
                RefreshToken = "mock-refresh-token-for-now", // Implement persistent refresh token rotation later
                ExpiresIn = 900,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role ?? "VIEWER",
                    ForcePasswordChange = user.ForcePasswordChange
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { success = false, message = "User not found." });

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role ?? "VIEWER",
                ForcePasswordChange = user.ForcePasswordChange
            });
        }
    }
}
