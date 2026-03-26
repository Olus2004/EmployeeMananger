using Microsoft.EntityFrameworkCore;
using Employee.Core.Models;
using EmployeeModel = Employee.Core.Models.Employee;

namespace Employee.Infrastructure.Data;

public class EmployeeDbContext : DbContext
{
    public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options) : base(options)
    {
    }

    public DbSet<Area> Areas { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Excel> Excels { get; set; }
    public DbSet<EmployeeModel> Employees { get; set; }
    public DbSet<Timesheet> Timesheets { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Backup> Backups { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<EmployeeProject> EmployeeProjects { get; set; }
    public DbSet<ProjectMonth> ProjectMonths { get; set; }
    public DbSet<Daily> Dailies { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Area configuration
        modelBuilder.Entity<Area>(entity =>
        {
            entity.ToTable("area");
            entity.HasKey(e => e.AreaId);
            entity.Property(e => e.AreaId).HasColumnName("area_id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(255);
            entity.Property(e => e.Active).HasColumnName("active").HasDefaultValue((short)1);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.Active).HasDatabaseName("idx_area_active");
            entity.HasIndex(e => e.Name).HasDatabaseName("idx_area_name");
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("user");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Password).HasColumnName("password").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Active).HasColumnName("active").HasDefaultValue((short)1);
            entity.Property(e => e.Role).HasColumnName("role").HasDefaultValue((short)2);
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired(false); // Cho phép NULL
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.Username).IsUnique().HasDatabaseName("uk_user_username");
            entity.HasIndex(e => e.Active).HasDatabaseName("idx_user_active");
            entity.HasIndex(e => e.EmployeeId).HasDatabaseName("fk_user_employee_idx");

            // Foreign key relationship - cho phép null, SetNull khi employee bị xóa
            entity.HasOne<EmployeeModel>()
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });

        // Excel configuration
        modelBuilder.Entity<Excel>(entity =>
        {
            entity.ToTable("excel");
            entity.HasKey(e => e.ExcelId);
            entity.Property(e => e.ExcelId).HasColumnName("excel_id");
            entity.Property(e => e.ExcelName).HasColumnName("excel_name").HasMaxLength(255).IsRequired();
            entity.Property(e => e.TimeUpload).HasColumnName("time_upload").HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Employee configuration
        modelBuilder.Entity<EmployeeModel>(entity =>
        {
            entity.ToTable("employee");
            entity.HasKey(e => e.EmployeeId);
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id");
            entity.Property(e => e.Fullname).HasColumnName("fullname").HasMaxLength(100);
            entity.Property(e => e.FullnameOther).HasColumnName("fullname_other").HasMaxLength(100);
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.Active).HasColumnName("active").HasDefaultValue((short)1);
            entity.Property(e => e.SkillLv).HasColumnName("skill_lv").HasColumnType("smallint").HasDefaultValue((short)0);
            entity.Property(e => e.SkillNote).HasColumnName("skill_note").HasColumnType("text");
            entity.Property(e => e.TimeTest).HasColumnName("time_test").HasColumnType("datetime");
            entity.Property(e => e.Sale).HasColumnName("sale").HasMaxLength(100);
            entity.Property(e => e.WorkDays).HasColumnName("work_days").HasDefaultValue(0);
            entity.Property(e => e.TravelDays).HasColumnName("travel_days").HasDefaultValue(0);
            entity.Property(e => e.LeaveDays).HasColumnName("leave_days").HasDefaultValue(0);
            entity.Property(e => e.UnauthorizedLeave).HasColumnName("unauthorized_leave").HasDefaultValue(0);
            entity.Property(e => e.VisaExtension).HasColumnName("visa_extension").HasDefaultValue(0);
            entity.Property(e => e.PermissionGranted).HasColumnName("permission_granted").HasDefaultValue(0);
            entity.Property(e => e.NightShiftDays).HasColumnName("night_shift_days").HasDefaultValue(0);
            entity.Property(e => e.TrainingDays).HasColumnName("training_days").HasDefaultValue(0);
            entity.Property(e => e.TotalDays).HasColumnName("total_days").HasDefaultValue(0);
            entity.Property(e => e.AreaId).HasColumnName("area_id");
            entity.Property(e => e.PlantName).HasColumnName("plant_name").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Area)
                .WithMany(a => a.Employees)
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Type).HasDatabaseName("idx_employee_type");
            entity.HasIndex(e => e.AreaId).HasDatabaseName("idx_employee_area");
            entity.HasIndex(e => e.Active).HasDatabaseName("idx_employee_active");
            entity.HasIndex(e => e.Fullname).HasDatabaseName("idx_employee_fullname");
            entity.HasIndex(e => e.FullnameOther).HasDatabaseName("idx_employee_fullname_other");
        });

        // Project configuration
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("project");
            entity.HasKey(e => e.ProjectId);
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.ProjectName).HasColumnName("project_name").HasMaxLength(255).IsRequired();
            entity.Property(e => e.ProjectCode).HasColumnName("project_code").HasMaxLength(50).IsRequired();
            entity.Property(e => e.ProjectDescription).HasColumnName("project_description").HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasIndex(e => e.ProjectCode).IsUnique().HasDatabaseName("uk_project_code");
            entity.HasIndex(e => e.ProjectName).HasDatabaseName("idx_project_name");
        });

        // EmployeeProject configuration
        modelBuilder.Entity<EmployeeProject>(entity =>
        {
            entity.ToTable("employee_project");
            entity.HasKey(e => e.EmployeeProjectId);
            entity.Property(e => e.EmployeeProjectId).HasColumnName("employee_project_id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired();
            entity.Property(e => e.ProjectId).HasColumnName("project_id").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Employee)
                .WithMany(emp => emp.EmployeeProjects)
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.EmployeeProjects)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.EmployeeId, e.ProjectId }).IsUnique().HasDatabaseName("uk_employee_project");
            entity.HasIndex(e => e.EmployeeId).HasDatabaseName("idx_employee_project_employee");
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("idx_employee_project_project");
        });

        // Timesheet configuration
        modelBuilder.Entity<Timesheet>(entity =>
        {
            entity.ToTable("timesheet");
            entity.HasKey(e => e.TimesheetId);
            entity.Property(e => e.TimesheetId).HasColumnName("timesheet_id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired();
            entity.Property(e => e.Day).HasColumnName("day").IsRequired();
            entity.Property(e => e.DayOfWeek).HasColumnName("day_of_week");
            entity.Property(e => e.WorkStart).HasColumnName("work_start").HasColumnType("TIME");
            entity.Property(e => e.WorkEnd).HasColumnName("work_end").HasColumnType("TIME");
            // WorkTime is computed, not stored in database
            entity.Ignore(e => e.WorkTime);
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue((short)1);
            entity.Property(e => e.AbsenceType).HasColumnName("absence_type");
            entity.Property(e => e.AbsenceReason).HasColumnName("absence_reason").HasMaxLength(255);
            entity.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(255);
            entity.Property(e => e.AreaId).HasColumnName("area_id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Employee)
                .WithMany(emp => emp.Timesheets)
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Area)
                .WithMany(a => a.Timesheets)
                .HasForeignKey(e => e.AreaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.EmployeeId, e.Day }).IsUnique().HasDatabaseName("uk_timesheet_employee_day");
            entity.HasIndex(e => e.Day).HasDatabaseName("idx_timesheet_day");
            entity.HasIndex(e => e.AreaId).HasDatabaseName("idx_timesheet_area");
            entity.HasIndex(e => e.Status).HasDatabaseName("idx_timesheet_status");
        });

        // Feedback configuration
        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.ToTable("feedback");
            entity.HasKey(e => e.FeedbackId);
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired();
            entity.Property(e => e.TimesheetId).HasColumnName("timesheet_id").IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasColumnType("TEXT");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.AdminResponse).HasColumnName("admin_response").HasColumnType("TEXT");
            entity.Property(e => e.RespondedAt).HasColumnName("responded_at");
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue((short)2);
            entity.Property(e => e.StatusResponse).HasColumnName("status_response");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Employee)
                .WithMany(emp => emp.Feedbacks)
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Timesheet)
                .WithMany(t => t.Feedbacks)
                .HasForeignKey(e => e.TimesheetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.EmployeeId).HasDatabaseName("idx_feedback_employee");
            entity.HasIndex(e => e.TimesheetId).HasDatabaseName("idx_feedback_timesheet");
            entity.HasIndex(e => e.Status).HasDatabaseName("idx_feedback_status");
        });

        // Backup configuration
        modelBuilder.Entity<Backup>(entity =>
        {
            entity.ToTable("backup");
            entity.HasKey(e => e.BackupId);
            entity.Property(e => e.BackupId).HasColumnName("backup_id");
            entity.Property(e => e.BackupName).HasColumnName("backup_name").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
            entity.Property(e => e.ExcelFileName).HasColumnName("excel_file_name").HasMaxLength(255);
            entity.Property(e => e.DataJson).HasColumnName("data_json").HasColumnType("LONGTEXT").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.RestoredAt).HasColumnName("restored_at");

            entity.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_backup_created_at");
        });

        // ProjectMonth configuration
        modelBuilder.Entity<ProjectMonth>(entity =>
        {
            entity.ToTable("project_month");
            entity.HasKey(e => e.ProjectMonthId);
            entity.Property(e => e.ProjectMonthId).HasColumnName("project_month_id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired();
            entity.Property(e => e.ProjectId).HasColumnName("project_id").IsRequired();
            entity.Property(e => e.Month).HasColumnName("month").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Project)
                .WithMany(p => p.ProjectMonths)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.EmployeeId, e.ProjectId, e.Month }).IsUnique().HasDatabaseName("uk_project_month_emp");
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("idx_project_month_project");
            entity.HasIndex(e => e.Month).HasDatabaseName("idx_project_month_month");
        });

        // Daily configuration
        modelBuilder.Entity<Daily>(entity =>
        {
            entity.ToTable("daily");
            entity.HasKey(e => e.DailyId);
            entity.Property(e => e.DailyId).HasColumnName("daily_id");
            entity.Property(e => e.EmployeeId).HasColumnName("employee_id").IsRequired();
            entity.Property(e => e.Day).HasColumnName("day").IsRequired();
            entity.Property(e => e.Fullname).HasColumnName("fullname").HasMaxLength(100);
            entity.Property(e => e.AreaName).HasColumnName("area_name").HasMaxLength(100);
            entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue((short)1);
            entity.Property(e => e.WorkStart).HasColumnName("work_start").HasColumnType("TIME");
            entity.Property(e => e.WorkEnd).HasColumnName("work_end").HasColumnType("TIME");
            entity.Property(e => e.SkillLv).HasColumnName("skill_lv").HasColumnType("smallint").HasDefaultValue((short)0);
            entity.Property(e => e.SkillNote).HasColumnName("skill_note").HasColumnType("text");
            entity.Property(e => e.TimeTest).HasColumnName("time_test").HasColumnType("datetime");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.EmployeeId, e.Day }).IsUnique().HasDatabaseName("uk_daily_employee_day");
            entity.HasIndex(e => e.Day).HasDatabaseName("idx_daily_day");
        });
    }
}

