namespace Employee.Application.ViewModels;

public class DashboardViewModel
{
    public EmployeeStatsViewModel EmployeeStats { get; set; } = new();
    public TodayAttendanceViewModel TodayAttendance { get; set; } = new();
    public List<TodayAttendanceByProjectViewModel> TodayAttendanceByProject { get; set; } = new();
    public List<TodayAbsenceByProjectViewModel> TodayAbsenceByProject { get; set; } = new();
    public int TotalAbsentToday { get; set; }
}

public class TodayAttendanceViewModel
{
    public int TotalWorking { get; set; }
    public int TotalDayShift { get; set; }
    public int TotalNightShift { get; set; }
    public List<TodayEmployeeAttendanceViewModel> Employees { get; set; } = new();
}

public class TodayEmployeeAttendanceViewModel
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public string ShiftType { get; set; } = string.Empty; // "Day" hoặc "Night"
    public TimeOnly? WorkStart { get; set; }
    public TimeOnly? WorkEnd { get; set; }
    public List<string> ProjectCodes { get; set; } = new();
    public string? AreaName { get; set; }
}

public class TodayAttendanceByProjectViewModel
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public int DayShiftCount { get; set; }
    public int NightShiftCount { get; set; }
    public int TotalCount { get; set; }
}

public class TodayAbsenceByProjectViewModel
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public int DayShiftCount { get; set; }
    public int NightShiftCount { get; set; }
    public int TotalCount { get; set; }
}

public class EmployeeStatsViewModel
{
    public int TotalEmployees { get; set; }
    public int VietnameseEmployees { get; set; } // Type = 1
    public int ChineseEmployees { get; set; } // Type = 2
    public int TotalAreas { get; set; }
}

public class FeedbackStatsViewModel
{
    public int TotalFeedbacks { get; set; }
    public int NewFeedbacks { get; set; } // Status = 2 (chưa phản hồi) hoặc StatusResponse = null
    public int ProcessedFeedbacks { get; set; } // StatusResponse = 1 (Đang xử lí)
    public int ClosedFeedbacks { get; set; } // StatusResponse = 2 (Đã đóng)
}

public class TopLeaveEmployeeViewModel
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public int LeaveDays { get; set; }
    public int UnauthorizedLeave { get; set; }
    public int AuthorizedLeave { get; set; }
}

public class TopNightShiftEmployeeViewModel
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public int NightShiftDays { get; set; }
}

public class TopWorkDaysEmployeeViewModel
{
    public int EmployeeId { get; set; }
    public string? Fullname { get; set; }
    public string? FullnameOther { get; set; }
    public int WorkDays { get; set; }
    public int TotalDays { get; set; }
}

