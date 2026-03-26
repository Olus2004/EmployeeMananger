namespace Employee.Application.ViewModels;

public class EmployeeViewModel
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public short Type { get; set; }
    public short Active { get; set; }
    public short SkillLv { get; set; }
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }
    public List<string> ProjectCodes { get; set; } = new List<string>();
    public string? Sale { get; set; }
    public int WorkDays { get; set; }
    public int TravelDays { get; set; }
    public int LeaveDays { get; set; }
    public int UnauthorizedLeave { get; set; }
    public int VisaExtension { get; set; }
    public int PermissionGranted { get; set; }
    public int NightShiftDays { get; set; }
    public int TrainingDays { get; set; }
    public int TotalDays { get; set; }
    public decimal? TotalWorkTime { get; set; } // Tổng thời gian làm việc (giờ)
    public int? AreaId { get; set; }
    public string? AreaName { get; set; }
    public string? PlantName { get; set; }
}

public class CreateEmployeeViewModel
{
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public short Type { get; set; }
    public short Active { get; set; } = 1;
    public short SkillLv { get; set; } = 0;
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }
    public List<string> ProjectCodes { get; set; } = new List<string>();
    public string? Sale { get; set; }
    public int? AreaId { get; set; }
    public string? PlantName { get; set; }
}

public class UpdateEmployeeViewModel
{
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public short Type { get; set; }
    public short Active { get; set; }
    public short SkillLv { get; set; }
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }
    public List<string> ProjectCodes { get; set; } = new List<string>();
    public string? Sale { get; set; }
    public int? AreaId { get; set; }
    public string? PlantName { get; set; }
    public int TravelDays { get; set; }
    public int VisaExtension { get; set; }
    public int PermissionGranted { get; set; }
    public int TrainingDays { get; set; }
}

