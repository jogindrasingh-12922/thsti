using System.ComponentModel.DataAnnotations;

namespace ThstiServer.DTOs
{
    public class FacultyRequest
    {
        public string? Slug { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? ResearchFocus { get; set; }
        public string? EducationSnippet { get; set; }
        public string? Office { get; set; }
        public string? ImageUrl { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? CvUrl { get; set; }
        public string? LabWebsiteUrl { get; set; }
        public string? Orcid { get; set; }
        public string? GoogleScholarUrl { get; set; }
        public string? ResearchGateUrl { get; set; }
        public string? LinkedinUrl { get; set; }
        
        public int PublicationsCount { get; set; }
        public int CitationsCount { get; set; }
        public int HIndex { get; set; }
        public int PatentsCount { get; set; }
        public int ProjectsCount { get; set; }
        
        public string? ResearchAreas { get; set; }
        public string? OverviewContent { get; set; }
        public string? EducationContent { get; set; }
        public string? ResearchContent { get; set; }
        public string? PublicationsContent { get; set; }
        public string? BooksContent { get; set; }
        public string? PatentsContent { get; set; }
        public string? AwardsContent { get; set; }
        
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
