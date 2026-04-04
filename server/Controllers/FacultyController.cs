using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThstiServer.Models;
using ThstiServer.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace ThstiServer.Controllers
{
    [ApiController]
    [Route("api/faculty")]
    public class FacultyController : ControllerBase
    {
        private readonly ThstiDbContext _context;

        public FacultyController(ThstiDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFaculty()
        {
            var faculty = await _context.Faculties
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
            return Ok(faculty);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetFacultyById(int id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null) return NotFound(new { error = "Faculty not found" });

            return Ok(faculty);
        }

        [Authorize(Roles = "SUPER_ADMIN,ADMIN,EDITOR")]
        [HttpPost]
        public async Task<IActionResult> CreateFaculty([FromBody] FacultyRequest req)
        {
            var slug = req.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = GenerateSlug(req.Name);
            }

            var existing = await _context.Faculties.AnyAsync(f => f.Slug == slug);
            if (existing)
            {
                slug = $"{slug}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            }

            try
            {
                var faculty = new Faculty
                {
                    Name = req.Name,
                    Slug = slug,
                    Designation = req.Designation,
                    Department = req.Department,
                    Location = req.Location,
                    ResearchFocus = req.ResearchFocus,
                    EducationSnippet = req.EducationSnippet,
                    Office = req.Office,
                    ImageUrl = req.ImageUrl,
                    Email = req.Email,
                    Phone = req.Phone,
                    CvUrl = req.CvUrl,
                    LabWebsiteUrl = req.LabWebsiteUrl,
                    Orcid = req.Orcid,
                    GoogleScholarUrl = req.GoogleScholarUrl,
                    ResearchGateUrl = req.ResearchGateUrl,
                    LinkedinUrl = req.LinkedinUrl,
                    PublicationsCount = req.PublicationsCount,
                    CitationsCount = req.CitationsCount,
                    HIndex = req.HIndex,
                    PatentsCount = req.PatentsCount,
                    ProjectsCount = req.ProjectsCount,
                    ResearchAreas = req.ResearchAreas,
                    OverviewContent = req.OverviewContent,
                    EducationContent = req.EducationContent,
                    ResearchContent = req.ResearchContent,
                    PublicationsContent = req.PublicationsContent,
                    BooksContent = req.BooksContent,
                    PatentsContent = req.PatentsContent,
                    AwardsContent = req.AwardsContent,
                    DisplayOrder = req.DisplayOrder,
                    IsActive = req.IsActive,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Faculties.Add(faculty);
                await _context.SaveChangesAsync();
                return StatusCode(201, faculty);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create faculty", details = ex.Message });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,ADMIN,EDITOR")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateFaculty(int id, [FromBody] FacultyRequest req)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null) return NotFound(new { error = "Faculty not found" });

            try
            {
                var slug = req.Slug;
                if (string.IsNullOrEmpty(slug))
                {
                    slug = GenerateSlug(req.Name);
                }

                if (faculty.Slug != slug)
                {
                    var existing = await _context.Faculties.AnyAsync(f => f.Slug == slug && f.Id != id);
                    if (existing)
                    {
                        slug = $"{slug}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
                    }
                }

                faculty.Name = req.Name;
                faculty.Slug = slug;
                faculty.Designation = req.Designation;
                faculty.Department = req.Department;
                faculty.Location = req.Location;
                faculty.ResearchFocus = req.ResearchFocus;
                faculty.EducationSnippet = req.EducationSnippet;
                faculty.Office = req.Office;
                faculty.ImageUrl = req.ImageUrl;
                faculty.Email = req.Email;
                faculty.Phone = req.Phone;
                faculty.CvUrl = req.CvUrl;
                faculty.LabWebsiteUrl = req.LabWebsiteUrl;
                faculty.Orcid = req.Orcid;
                faculty.GoogleScholarUrl = req.GoogleScholarUrl;
                faculty.ResearchGateUrl = req.ResearchGateUrl;
                faculty.LinkedinUrl = req.LinkedinUrl;
                faculty.PublicationsCount = req.PublicationsCount;
                faculty.CitationsCount = req.CitationsCount;
                faculty.HIndex = req.HIndex;
                faculty.PatentsCount = req.PatentsCount;
                faculty.ProjectsCount = req.ProjectsCount;
                faculty.ResearchAreas = req.ResearchAreas;
                faculty.OverviewContent = req.OverviewContent;
                faculty.EducationContent = req.EducationContent;
                faculty.ResearchContent = req.ResearchContent;
                faculty.PublicationsContent = req.PublicationsContent;
                faculty.BooksContent = req.BooksContent;
                faculty.PatentsContent = req.PatentsContent;
                faculty.AwardsContent = req.AwardsContent;
                faculty.DisplayOrder = req.DisplayOrder;
                faculty.IsActive = req.IsActive;
                faculty.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(faculty);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to update faculty", details = ex.Message });
            }
        }

        [Authorize(Roles = "SUPER_ADMIN,ADMIN,EDITOR")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteFaculty(int id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null) return NotFound();

            _context.Faculties.Remove(faculty);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Faculty deleted successfully" });
        }

        private string GenerateSlug(string phrase)
        {
            if (string.IsNullOrEmpty(phrase)) return "";
            string str = phrase.ToLowerInvariant();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", "-").Trim('-');
            return str;
        }
    }
}
