using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/settings")]
    public class SettingsController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public SettingsController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Id == 1);
            if (settings == null)
            {
                settings = new GlobalSetting
                {
                    Id = 1,
                    SiteName = "THSTI CMS",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.GlobalSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [Authorize(Roles = "SUPER_ADMIN,EDITOR")]
        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] SettingsRequest req)
        {
            try
            {
                var settings = await _context.GlobalSettings.FirstOrDefaultAsync(s => s.Id == 1);
                
                if (settings == null)
                {
                    settings = new GlobalSetting
                    {
                        Id = 1,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.GlobalSettings.Add(settings);
                }

                settings.SiteName = req.SiteName;
                settings.LogoUrl = req.LogoUrl;
                settings.ContactEmail = req.ContactEmail;
                settings.ContactPhone = req.ContactPhone;
                settings.Address = req.Address;
                settings.MapLink = req.MapLink;
                settings.WorkingHours = req.WorkingHours;
                settings.FacebookUrl = req.FacebookUrl;
                settings.TwitterUrl = req.TwitterUrl;
                settings.LinkedinUrl = req.LinkedinUrl;
                settings.CopyrightText = req.CopyrightText;
                
                settings.PreFooterViewAllText = req.PreFooterViewAllText;
                settings.PreFooterViewAllUrl = req.PreFooterViewAllUrl;
                settings.PreFooterViewAllActive = req.PreFooterViewAllActive;
                
                settings.VirtualTourText = req.VirtualTourText;
                settings.VirtualTourUrl = req.VirtualTourUrl;
                settings.VirtualTourActive = req.VirtualTourActive;
                
                settings.IsSearchEnabled = req.IsSearchEnabled;

                settings.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update settings", details = ex.Message });
            }
        }
    }
}
