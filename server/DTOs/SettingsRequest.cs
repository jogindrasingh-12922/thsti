using System.ComponentModel.DataAnnotations;

namespace ThstiServer.DTOs
{
    public class SettingsRequest
    {
        [Required]
        [MinLength(1)]
        public string SiteName { get; set; } = null!;

        public string? LogoUrl { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? MapLink { get; set; }
        public string? WorkingHours { get; set; }
        public string? FacebookUrl { get; set; }
        public string? TwitterUrl { get; set; }
        public string? LinkedinUrl { get; set; }
        public string? CopyrightText { get; set; }
        
        public string? PreFooterViewAllText { get; set; }
        public string? PreFooterViewAllUrl { get; set; }
        public bool PreFooterViewAllActive { get; set; } = true;
        
        public string? VirtualTourText { get; set; } = "VIRTUAL TOUR";
        public string? VirtualTourUrl { get; set; } = "#";
        public bool VirtualTourActive { get; set; } = true;
        
        public bool IsSearchEnabled { get; set; } = true;
    }
}
