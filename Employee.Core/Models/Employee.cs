namespace Employee.Core.Models;

public class Employee
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public short Type { get; set; } // 1: VN, 2: TQ
    public short Active { get; set; } = 1; // 1: hoạt động, 2: ko hoạt động

    public short SkillLv { get; set; } = 0;
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }

    public string? Sale { get; set; }

    public int WorkDays { get; set; } = 0;
    public int TravelDays { get; set; } = 0;
    public int LeaveDays { get; set; } = 0;
    public int UnauthorizedLeave { get; set; } = 0;
    public int VisaExtension { get; set; } = 0;
    public int PermissionGranted { get; set; } = 0;
    public int NightShiftDays { get; set; } = 0;
    public int TrainingDays { get; set; } = 0;
    public int TotalDays { get; set; } = 0;

    public int? AreaId { get; set; }
    public string? PlantName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Area? Area { get; set; }
    public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = new List<EmployeeProject>();
}

