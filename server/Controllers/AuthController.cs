using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using ThstiServer.Utils;
using System.Linq;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ThstiDbContext _context;
        private readonly IConfiguration _config;
        private readonly Mailer _mailer;

        public AuthController(ThstiDbContext context, IConfiguration config, Mailer mailer)
        {
            _context = context;
            _config = config;
            _mailer = mailer;
        }

        private string GetClientIp()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private string GetUserAgent()
        {
            return Request.Headers["User-Agent"].ToString() ?? "unknown";
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

            // Generate refresh token
            byte[] rawRefreshBytes = new byte[48];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(rawRefreshBytes);
            }
            var rawRefresh = Convert.ToHexString(rawRefreshBytes);
            var refreshHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawRefresh)));

            var refreshToken = new RefreshToken
            {
                TokenHash = refreshHash,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return Ok(new LoginResponse
            {
                Success = true,
                AccessToken = jwt,
                RefreshToken = rawRefresh.ToLower(),
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

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest(new { success = false, message = "Refresh token is required." });

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.RefreshToken)));

            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (storedToken == null || storedToken.RevokedAt != null || storedToken.ExpiresAt < DateTime.UtcNow)
                return Unauthorized(new { success = false, message = "Invalid or expired refresh token." });

            var user = storedToken.User;
            if (user == null || !user.IsActive)
                return Unauthorized(new { success = false, message = "Account is inactive." });

            storedToken.RevokedAt = DateTime.UtcNow;

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

            byte[] newRawRefreshBytes = new byte[48];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(newRawRefreshBytes);
            }
            var newRawRefresh = Convert.ToHexString(newRawRefreshBytes);
            var newRefreshHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(newRawRefresh)));

            var newRefreshToken = new RefreshToken
            {
                TokenHash = newRefreshHash,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };
            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                accessToken = jwt,
                refreshToken = newRawRefresh.ToLower(),
                expiresIn = 900
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest(new { success = false, message = "Refresh token is required." });

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.RefreshToken)));

            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (storedToken != null && storedToken.RevokedAt == null)
            {
                storedToken.RevokedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "Logged out successfully." });
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest(new { success = false, message = "Valid email is required." });

            var genericResponse = new { success = true, message = "If an account exists with that email, we have sent further instructions." };

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null || !user.IsActive)
                return Ok(genericResponse);

            byte[] rawBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(rawBytes);
            }
            var rawToken = Convert.ToHexString(rawBytes).ToLower();
            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                RequestedIp = GetClientIp(),
                UserAgent = GetUserAgent(),
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var adminAppUrl = _config["ADMIN_APP_URL"] ?? "http://localhost:5175";
            var resetUrl = $"{adminAppUrl}/reset-password?token={rawToken}";

            _ = _mailer.SendForgotPasswordEmailAsync(user.Email, resetUrl);

            return Ok(genericResponse);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword) || string.IsNullOrEmpty(request.ConfirmPassword))
                return BadRequest(new { success = false, message = "Token, new password, and confirmation are required." });

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest(new { success = false, message = "Passwords do not match." });

            var validation = PasswordPolicy.ValidatePassword(request.NewPassword);
            if (!validation.Valid)
                return BadRequest(new { success = false, message = validation.Message });

            var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(request.Token.ToLower())));

            var resetToken = await _context.PasswordResetTokens
                .Include(prt => prt.User)
                .FirstOrDefaultAsync(prt => prt.TokenHash == tokenHash);

            if (resetToken == null || resetToken.UsedAt != null || resetToken.ExpiresAt < DateTime.UtcNow)
                return BadRequest(new { success = false, message = "Invalid or expired password reset token." });

            var user = resetToken.User;
            if (user == null) return BadRequest(new { success = false, message = "Invalid token." });

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordUpdatedAt = DateTime.UtcNow;
            user.FailedLoginAttempts = 0;
            user.IsLocked = false;
            user.LockedUntil = null;
            user.ForcePasswordChange = false;

            resetToken.UsedAt = DateTime.UtcNow;

            // Delete active refresh tokens
            var activeRefreshTokens = _context.RefreshTokens.Where(rt => rt.UserId == user.Id);
            _context.RefreshTokens.RemoveRange(activeRefreshTokens);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Password has been successfully reset." });
        }

        [HttpPost("forgot-username")]
        public async Task<IActionResult> ForgotUsername([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest(new { success = false, message = "Valid email is required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user != null)
            {
                _ = _mailer.SendForgotUsernameEmailAsync(user.Email, user.Email);
            }

            return Ok(new { success = true, message = "If an account exists with that email, we have sent further instructions." });
        }
    }

    public class RefreshTokenRequest
    {
        public string? RefreshToken { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string? Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
