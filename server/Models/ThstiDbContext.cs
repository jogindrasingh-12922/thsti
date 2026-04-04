using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ThstiServer.Models;

public partial class ThstiDbContext : DbContext
{
    public ThstiDbContext()
    {
    }

    public ThstiDbContext(DbContextOptions<ThstiDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuthAuditLog> AuthAuditLogs { get; set; }

    public virtual DbSet<ContactSubmission> ContactSubmissions { get; set; }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<FooterLink> FooterLinks { get; set; }

    public virtual DbSet<Gallery> Galleries { get; set; }

    public virtual DbSet<GalleryCategory> GalleryCategories { get; set; }

    public virtual DbSet<GlobalSetting> GlobalSettings { get; set; }

    public virtual DbSet<HeroSlide> HeroSlides { get; set; }

    public virtual DbSet<HomeSection> HomeSections { get; set; }

    public virtual DbSet<InternationalCollaboration> InternationalCollaborations { get; set; }

    public virtual DbSet<LifeAtThstiItem> LifeAtThstiItems { get; set; }

    public virtual DbSet<MarqueeItem> MarqueeItems { get; set; }

    public virtual DbSet<Medium> Media { get; set; }

    public virtual DbSet<Menu> Menus { get; set; }

    public virtual DbSet<News> News { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<NotificationCategory> NotificationCategories { get; set; }

    public virtual DbSet<Page> Pages { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<PreFooterLink> PreFooterLinks { get; set; }

    public virtual DbSet<PrismaMigration> PrismaMigrations { get; set; }

    public virtual DbSet<Programme> Programmes { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<ResearchCenter> ResearchCenters { get; set; }

    public virtual DbSet<ResearchFacility> ResearchFacilities { get; set; }

    public virtual DbSet<TranslationLanguage> TranslationLanguages { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Database=thsti;Username=postgres;Password=root");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("AuditEvent", new[] { "LOGIN_SUCCESS", "LOGIN_FAIL", "LOGIN_LOCKED", "LOGOUT", "TOKEN_REFRESH", "PASSWORD_CHANGE", "ROLE_CHANGE", "USER_CREATED", "USER_UPDATED", "USER_DEACTIVATED", "PASSWORD_RESET_ADMIN", "PASSWORD_CHANGED_SELF" })
            .HasPostgresEnum("HomeSectionType", new[] { "HERO", "ABOUT", "SERVICES", "NEWS", "GALLERY", "CONTACT", "LIFE_AT_THSTI" })
            .HasPostgresEnum("Role", new[] { "SUPER_ADMIN", "EDITOR", "VIEWER", "ADMIN" });

        modelBuilder.Entity<AuthAuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AuthAuditLog_pkey");

            entity.ToTable("AuthAuditLog");

            entity.HasIndex(e => new { e.Email, e.CreatedAt }, "AuthAuditLog_email_createdAt_idx");

            entity.HasIndex(e => new { e.UserId, e.CreatedAt }, "AuthAuditLog_userId_createdAt_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Ip).HasColumnName("ip");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.UserAgent).HasColumnName("userAgent");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.AuthAuditLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("AuthAuditLog_userId_fkey");
        });

        modelBuilder.Entity<ContactSubmission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ContactSubmission_pkey");

            entity.ToTable("ContactSubmission");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.IsResolved)
                .HasDefaultValue(false)
                .HasColumnName("isResolved");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Phone).HasColumnName("phone");
        });

        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Faculty_pkey");

            entity.ToTable("Faculty");

            entity.HasIndex(e => e.Slug, "Faculty_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AwardsContent).HasColumnName("awardsContent");
            entity.Property(e => e.BooksContent).HasColumnName("booksContent");
            entity.Property(e => e.CitationsCount)
                .HasDefaultValue(0)
                .HasColumnName("citationsCount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.CvUrl).HasColumnName("cvUrl");
            entity.Property(e => e.Department).HasColumnName("department");
            entity.Property(e => e.Designation).HasColumnName("designation");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.EducationContent).HasColumnName("educationContent");
            entity.Property(e => e.EducationSnippet).HasColumnName("educationSnippet");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.GoogleScholarUrl).HasColumnName("googleScholarUrl");
            entity.Property(e => e.HIndex)
                .HasDefaultValue(0)
                .HasColumnName("hIndex");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.LabWebsiteUrl).HasColumnName("labWebsiteUrl");
            entity.Property(e => e.LinkedinUrl).HasColumnName("linkedinUrl");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Office).HasColumnName("office");
            entity.Property(e => e.Orcid).HasColumnName("orcid");
            entity.Property(e => e.OverviewContent).HasColumnName("overviewContent");
            entity.Property(e => e.PatentsContent).HasColumnName("patentsContent");
            entity.Property(e => e.PatentsCount)
                .HasDefaultValue(0)
                .HasColumnName("patentsCount");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.ProjectsCount)
                .HasDefaultValue(0)
                .HasColumnName("projectsCount");
            entity.Property(e => e.PublicationsContent).HasColumnName("publicationsContent");
            entity.Property(e => e.PublicationsCount)
                .HasDefaultValue(0)
                .HasColumnName("publicationsCount");
            entity.Property(e => e.ResearchAreas)
                .HasColumnType("jsonb")
                .HasColumnName("researchAreas");
            entity.Property(e => e.ResearchContent).HasColumnName("researchContent");
            entity.Property(e => e.ResearchFocus).HasColumnName("researchFocus");
            entity.Property(e => e.ResearchGateUrl).HasColumnName("researchGateUrl");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<FooterLink>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("FooterLink_pkey");

            entity.ToTable("FooterLink");

            entity.HasIndex(e => new { e.IsActive, e.Column, e.DisplayOrder }, "FooterLink_isActive_column_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Column).HasColumnName("column");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.Label).HasColumnName("label");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Url).HasColumnName("url");
        });

        modelBuilder.Entity<Gallery>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Gallery_pkey");

            entity.ToTable("Gallery");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoryId).HasColumnName("categoryId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.Title).HasColumnName("title");

            entity.HasOne(d => d.Category).WithMany(p => p.Galleries)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Gallery_categoryId_fkey");
        });

        modelBuilder.Entity<GalleryCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GalleryCategory_pkey");

            entity.ToTable("GalleryCategory");

            entity.HasIndex(e => e.Name, "GalleryCategory_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<GlobalSetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GlobalSettings_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.ContactEmail).HasColumnName("contactEmail");
            entity.Property(e => e.ContactPhone).HasColumnName("contactPhone");
            entity.Property(e => e.CopyrightText).HasColumnName("copyrightText");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.FacebookUrl).HasColumnName("facebookUrl");
            entity.Property(e => e.IsSearchEnabled)
                .HasDefaultValue(true)
                .HasColumnName("isSearchEnabled");
            entity.Property(e => e.LinkedinUrl).HasColumnName("linkedinUrl");
            entity.Property(e => e.LogoUrl).HasColumnName("logoUrl");
            entity.Property(e => e.MapLink).HasColumnName("mapLink");
            entity.Property(e => e.PreFooterViewAllActive)
                .HasDefaultValue(true)
                .HasColumnName("preFooterViewAllActive");
            entity.Property(e => e.PreFooterViewAllText)
                .HasDefaultValueSql("'VIEW ALL'::text")
                .HasColumnName("preFooterViewAllText");
            entity.Property(e => e.PreFooterViewAllUrl)
                .HasDefaultValueSql("'#'::text")
                .HasColumnName("preFooterViewAllUrl");
            entity.Property(e => e.SiteName).HasColumnName("siteName");
            entity.Property(e => e.TwitterUrl).HasColumnName("twitterUrl");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.VirtualTourActive)
                .HasDefaultValue(true)
                .HasColumnName("virtualTourActive");
            entity.Property(e => e.VirtualTourText)
                .HasDefaultValueSql("'VIRTUAL TOUR'::text")
                .HasColumnName("virtualTourText");
            entity.Property(e => e.VirtualTourUrl)
                .HasDefaultValueSql("'#'::text")
                .HasColumnName("virtualTourUrl");
            entity.Property(e => e.WorkingHours).HasColumnName("workingHours");
        });

        modelBuilder.Entity<HeroSlide>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("HeroSlide_pkey");

            entity.ToTable("HeroSlide");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "HeroSlide_isActive_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsActiveVideo)
                .HasDefaultValue(false)
                .HasColumnName("isActiveVideo");
            entity.Property(e => e.MediaUrl).HasColumnName("mediaUrl");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.PosterUrl).HasColumnName("posterUrl");
            entity.Property(e => e.RouteUrl).HasColumnName("routeUrl");
            entity.Property(e => e.ShowText)
                .HasDefaultValue(true)
                .HasColumnName("showText");
            entity.Property(e => e.Subtitle).HasColumnName("subtitle");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Type)
                .HasDefaultValueSql("'IMAGE'::text")
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<HomeSection>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("HomeSection_pkey");

            entity.ToTable("HomeSection");

            entity.HasIndex(e => e.IsActive, "HomeSection_isActive_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SectionType).HasColumnName("sectionType");
            entity.Property(e => e.CtaLink).HasColumnName("ctaLink");
            entity.Property(e => e.CtaText).HasColumnName("ctaText");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb")
                .HasColumnName("metadata");
            entity.Property(e => e.Subtitle).HasColumnName("subtitle");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<InternationalCollaboration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("InternationalCollaboration_pkey");

            entity.ToTable("InternationalCollaboration");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.Link).HasColumnName("link");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<LifeAtThstiItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("LifeAtThstiItem_pkey");

            entity.ToTable("LifeAtThstiItem");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "LifeAtThstiItem_isActive_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ButtonLink).HasColumnName("buttonLink");
            entity.Property(e => e.ButtonText).HasColumnName("buttonText");
            entity.Property(e => e.Category).HasColumnName("category");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsExternal)
                .HasDefaultValue(false)
                .HasColumnName("isExternal");
            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb")
                .HasColumnName("metadata");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<MarqueeItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("MarqueeItem_pkey");

            entity.ToTable("MarqueeItem");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "MarqueeItem_isActive_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Url).HasColumnName("url");
        });

        modelBuilder.Entity<Medium>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Media_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AltText).HasColumnName("altText");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Filename).HasColumnName("filename");
            entity.Property(e => e.MimeType).HasColumnName("mimeType");
            entity.Property(e => e.Size).HasColumnName("size");
            entity.Property(e => e.StoragePath).HasColumnName("storagePath");
            entity.Property(e => e.Url).HasColumnName("url");
        });

        modelBuilder.Entity<Menu>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Menu_pkey");

            entity.ToTable("Menu");

            entity.HasIndex(e => new { e.IsActive, e.IsVisible }, "Menu_isActive_isVisible_idx");

            entity.HasIndex(e => e.Order, "Menu_order_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsExternal)
                .HasDefaultValue(false)
                .HasColumnName("isExternal");
            entity.Property(e => e.IsMegaMenu)
                .HasDefaultValue(false)
                .HasColumnName("isMegaMenu");
            entity.Property(e => e.IsVisible)
                .HasDefaultValue(true)
                .HasColumnName("isVisible");
            entity.Property(e => e.Label).HasColumnName("label");
            entity.Property(e => e.Location)
                .HasDefaultValueSql("'HEADER'::text")
                .HasColumnName("location");
            entity.Property(e => e.Order)
                .HasDefaultValue(0)
                .HasColumnName("order");
            entity.Property(e => e.ParentId).HasColumnName("parentId");
            entity.Property(e => e.Route).HasColumnName("route");
            entity.Property(e => e.TargetBlank)
                .HasDefaultValue(false)
                .HasColumnName("targetBlank");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Menu_parentId_fkey");
        });

        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("News_pkey");

            entity.HasIndex(e => new { e.IsActive, e.PublishDate }, "News_isActive_publishDate_idx");

            entity.HasIndex(e => e.Slug, "News_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsFeatured)
                .HasDefaultValue(false)
                .HasColumnName("isFeatured");
            entity.Property(e => e.PublishDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("publishDate");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.Summary).HasColumnName("summary");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Notification_pkey");

            entity.ToTable("Notification");

            entity.HasIndex(e => new { e.IsActive, e.Type, e.DisplayOrder }, "Notification_isActive_type_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ButtonText).HasColumnName("buttonText");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsNew)
                .HasDefaultValue(false)
                .HasColumnName("isNew");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.PublishDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("publishDate");
            entity.Property(e => e.Summary).HasColumnName("summary");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Type)
                .HasDefaultValueSql("'Announcements'::text")
                .HasColumnName("type");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Url).HasColumnName("url");
        });

        modelBuilder.Entity<NotificationCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("NotificationCategory_pkey");

            entity.ToTable("NotificationCategory");

            entity.HasIndex(e => e.Name, "NotificationCategory_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Page>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Page_pkey");

            entity.ToTable("Page");

            entity.HasIndex(e => e.IsActive, "Page_isActive_idx");

            entity.HasIndex(e => e.Slug, "Page_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.MetaDescription).HasColumnName("metaDescription");
            entity.Property(e => e.MetaTitle).HasColumnName("metaTitle");
            entity.Property(e => e.OgImage).HasColumnName("ogImage");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PasswordResetToken_pkey");

            entity.ToTable("PasswordResetToken");

            entity.HasIndex(e => e.TokenHash, "PasswordResetToken_tokenHash_idx");

            entity.HasIndex(e => e.TokenHash, "PasswordResetToken_tokenHash_key").IsUnique();

            entity.HasIndex(e => e.UserId, "PasswordResetToken_userId_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("expiresAt");
            entity.Property(e => e.RequestedIp).HasColumnName("requestedIp");
            entity.Property(e => e.TokenHash).HasColumnName("tokenHash");
            entity.Property(e => e.UsedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("usedAt");
            entity.Property(e => e.UserAgent).HasColumnName("userAgent");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("PasswordResetToken_userId_fkey");
        });

        modelBuilder.Entity<PreFooterLink>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PreFooterLink_pkey");

            entity.ToTable("PreFooterLink");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "PreFooterLink_isActive_displayOrder_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Url).HasColumnName("url");
        });

        modelBuilder.Entity<PrismaMigration>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("_prisma_migrations_pkey");

            entity.ToTable("_prisma_migrations");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AppliedStepsCount)
                .HasDefaultValue(0)
                .HasColumnName("applied_steps_count");
            entity.Property(e => e.Checksum)
                .HasMaxLength(64)
                .HasColumnName("checksum");
            entity.Property(e => e.FinishedAt).HasColumnName("finished_at");
            entity.Property(e => e.Logs).HasColumnName("logs");
            entity.Property(e => e.MigrationName)
                .HasMaxLength(255)
                .HasColumnName("migration_name");
            entity.Property(e => e.RolledBackAt).HasColumnName("rolled_back_at");
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("started_at");
        });

        modelBuilder.Entity<Programme>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Programme_pkey");

            entity.ToTable("Programme");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "Programme_isActive_displayOrder_idx");

            entity.HasIndex(e => e.Slug, "Programme_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsExternal)
                .HasDefaultValue(false)
                .HasColumnName("isExternal");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.RouteUrl).HasColumnName("routeUrl");
            entity.Property(e => e.ShortDescription).HasColumnName("shortDescription");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("RefreshToken_pkey");

            entity.ToTable("RefreshToken");

            entity.HasIndex(e => e.TokenHash, "RefreshToken_tokenHash_idx");

            entity.HasIndex(e => e.TokenHash, "RefreshToken_tokenHash_key").IsUnique();

            entity.HasIndex(e => e.UserId, "RefreshToken_userId_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("expiresAt");
            entity.Property(e => e.RevokedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("revokedAt");
            entity.Property(e => e.TokenHash).HasColumnName("tokenHash");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("RefreshToken_userId_fkey");
        });

        modelBuilder.Entity<ResearchCenter>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ResearchCenter_pkey");

            entity.ToTable("ResearchCenter");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "ResearchCenter_isActive_displayOrder_idx");

            entity.HasIndex(e => e.Slug, "ResearchCenter_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.Excerpt).HasColumnName("excerpt");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsExternal)
                .HasDefaultValue(false)
                .HasColumnName("isExternal");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.RouteUrl).HasColumnName("routeUrl");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<ResearchFacility>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ResearchFacility_pkey");

            entity.ToTable("ResearchFacility");

            entity.HasIndex(e => new { e.IsActive, e.DisplayOrder }, "ResearchFacility_isActive_displayOrder_idx");

            entity.HasIndex(e => e.Slug, "ResearchFacility_slug_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("displayOrder");
            entity.Property(e => e.Excerpt).HasColumnName("excerpt");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsExternal)
                .HasDefaultValue(false)
                .HasColumnName("isExternal");
            entity.Property(e => e.OpenInNewTab)
                .HasDefaultValue(false)
                .HasColumnName("openInNewTab");
            entity.Property(e => e.RouteUrl).HasColumnName("routeUrl");
            entity.Property(e => e.Slug).HasColumnName("slug");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<TranslationLanguage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TranslationLanguage_pkey");

            entity.ToTable("TranslationLanguage");

            entity.HasIndex(e => e.Code, "TranslationLanguage_code_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Code).HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.Label).HasColumnName("label");
            entity.Property(e => e.Order)
                .HasDefaultValue(0)
                .HasColumnName("order");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("User_pkey");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "User_email_key").IsUnique();

            entity.HasIndex(e => e.Username, "User_username_idx");

            entity.HasIndex(e => e.Username, "User_username_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FailedLoginAttempts)
                .HasDefaultValue(0)
                .HasColumnName("failedLoginAttempts");
            entity.Property(e => e.ForcePasswordChange)
                .HasDefaultValue(false)
                .HasColumnName("forcePasswordChange");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("isActive");
            entity.Property(e => e.IsLocked)
                .HasDefaultValue(false)
                .HasColumnName("isLocked");
            entity.Property(e => e.LastLoginAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("lastLoginAt");
            entity.Property(e => e.LockedUntil)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("lockedUntil");
            entity.Property(e => e.Mobile).HasColumnName("mobile");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.PasswordUpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("passwordUpdatedAt");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.Role).HasColumnName("role").HasConversion<string>();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
