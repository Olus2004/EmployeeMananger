namespace Employee.Application.ViewModels;

public class TimesheetViewModel
{
    public int TimesheetId { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public DateOnly Day { get; set; }
    public byte? DayOfWeek { get; set; }
    public TimeOnly? WorkStart { get; set; }
    public TimeOnly? WorkEnd { get; set; }
    public decimal? WorkTime { get; set; }
    public short Status { get; set; }
    public short? AbsenceType { get; set; }
    public string? AbsenceReason { get; set; }
    public string? Notes { get; set; }
    public int? AreaId { get; set; }
    public string? AreaName { get; set; }
}

public class CreateTimesheetViewModel
{
    public int EmployeeId { get; set; }
    public DateOnly Day { get; set; }
    public byte? DayOfWeek { get; set; }
    public TimeOnly? WorkStart { get; set; }
    public TimeOnly? WorkEnd { get; set; }
    public decimal? WorkTime { get; set; }
    public short Status { get; set; } = 1;
    public short? AbsenceType { get; set; }
    public string? AbsenceReason { get; set; }
    public string? Notes { get; set; }
    public int? AreaId { get; set; }
}

public class UpdateTimesheetViewModel
{
    public byte? DayOfWeek { get; set; }
    public TimeOnly? WorkStart { get; set; }
    public TimeOnly? WorkEnd { get; set; }
    public decimal? WorkTime { get; set; }
    public short Status { get; set; }
    public short? AbsenceType { get; set; }
    public string? AbsenceReason { get; set; }
    public string? Notes { get; set; }
    public int? AreaId { get; set; }
}

