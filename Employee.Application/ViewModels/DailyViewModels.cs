using System;

namespace Employee.Application.ViewModels;

public class DailyViewModel
{
    public int DailyId { get; set; }
    public int EmployeeId { get; set; }
    public string? Day { get; set; }
    public string? Fullname { get; set; }
    public string? AreaName { get; set; }
    public List<string>? ProjectCodes { get; set; }
    public short Status { get; set; }
    public string? StatusText { get; set; }
    public string? WorkStart { get; set; }
    public string? WorkEnd { get; set; }
    public short SkillLv { get; set; }
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }
}

public class CreateDailyViewModel
{
    public int EmployeeId { get; set; }
    public string? Day { get; set; } // yyyy-MM-dd
    public short Status { get; set; }
    public string? WorkStart { get; set; } // HH:mm
    public string? WorkEnd { get; set; } // HH:mm
}

public class UpdateDailyViewModel
{
    public short Status { get; set; }
    public string? WorkStart { get; set; }
    public string? WorkEnd { get; set; }
    public short? SkillLv { get; set; }
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }
}

public class DailyStatsViewModel
{
    public int VNCount { get; set; }
    public int CNCount { get; set; }
    public string MonthDisplay { get; set; } = string.Empty;
}
