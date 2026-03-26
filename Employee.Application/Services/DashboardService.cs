using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using EmployeeModel = Employee.Core.Models.Employee;
using Employee.Core.Models;
using Microsoft.EntityFrameworkCore;
using Employee.Infrastructure.Data;

namespace Employee.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly IAreaRepository _areaRepository;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly EmployeeDbContext _context;

    public DashboardService(
        IEmployeeRepository employeeRepository,
        IFeedbackRepository feedbackRepository,
        IAreaRepository areaRepository,
        ITimesheetRepository timesheetRepository,
        IProjectRepository projectRepository,
        EmployeeDbContext context)
    {
        _employeeRepository = employeeRepository;
        _feedbackRepository = feedbackRepository;
        _areaRepository = areaRepository;
        _timesheetRepository = timesheetRepository;
        _projectRepository = projectRepository;
        _context = context;
    }

    public async Task<DashboardViewModel> GetDashboardDataAsync(DateOnly? date = null)
    {
        var dashboard = new DashboardViewModel();
        var today = date ?? DateOnly.FromDateTime(DateTime.Now);

        // Tính toán thống kê nhân viên dựa trên ProjectMonth của tháng được chọn
        var year = today.Year;
        var month = today.Month;

        var activeProjectEmployees = await _context.ProjectMonths
            .Include(pm => pm.Employee)
            .Where(pm => pm.Month.Year == year && pm.Month.Month == month && pm.Employee != null && pm.Employee.Active == 1)
            .Select(pm => pm.Employee)
            .Distinct()
            .ToListAsync();
        
        dashboard.EmployeeStats = new EmployeeStatsViewModel
        {
            TotalEmployees = activeProjectEmployees.Count,
            VietnameseEmployees = activeProjectEmployees.Count(e => e!.Type == 1),
            ChineseEmployees = activeProjectEmployees.Count(e => e!.Type == 2),
            TotalAreas = (await _areaRepository.GetAllAsync()).Count(a => a.Active == 1)
        };

        // Lấy tất cả timesheet của hôm nay
        var todayTimesheets = await _context.Timesheets
            .Include(t => t.Employee)
                .ThenInclude(e => e!.EmployeeProjects)
                    .ThenInclude(ep => ep.Project)
            .Include(t => t.Employee)
                .ThenInclude(e => e!.Area)
            .Where(t => t.Day == today && t.Employee != null && t.Employee.Active == 1)
            .ToListAsync();

        var nightShiftStart = new TimeOnly(20, 0); // 20:00
        var nightShiftEnd = new TimeOnly(7, 0); // 7:00

        // Phân loại ca ngày/đêm
        bool IsNightShift(TimeOnly? workStart, TimeOnly? workEnd)
        {
            if (!workStart.HasValue || !workEnd.HasValue) return false;
            return workStart.Value >= nightShiftStart || workEnd.Value <= nightShiftEnd;
        }

        // 1. Danh sách tất cả người đi làm hôm nay (status = 1: đi làm)
        var workingToday = todayTimesheets
            .Where(t => t.Status == 1)
            .Select(t => new TodayEmployeeAttendanceViewModel
            {
                EmployeeId = t.EmployeeId,
                Fullname = t.Employee!.Fullname,
                FullnameOther = t.Employee.FullnameOther,
                ShiftType = IsNightShift(t.WorkStart, t.WorkEnd) ? "Night" : "Day",
                WorkStart = t.WorkStart,
                WorkEnd = t.WorkEnd,
                ProjectCodes = t.Employee.EmployeeProjects?.Select(ep => ep.Project.ProjectCode).ToList() ?? new List<string>(),
                AreaName = t.Employee.Area?.Name
            })
            .ToList();

        dashboard.TodayAttendance = new TodayAttendanceViewModel
        {
            TotalWorking = workingToday.Count,
            TotalDayShift = workingToday.Count(e => e.ShiftType == "Day"),
            TotalNightShift = workingToday.Count(e => e.ShiftType == "Night"),
            Employees = workingToday
        };

        // 2. Thống kê số người đi làm hôm nay theo project (phân theo ngày/đêm)
        var allProjects = await _projectRepository.GetAllProjectsAsync();
        var workingByProject = new List<TodayAttendanceByProjectViewModel>();

        foreach (var project in allProjects)
        {
            var projectEmployees = workingToday
                .Where(e => e.ProjectCodes.Contains(project.ProjectCode))
                .ToList();

            workingByProject.Add(new TodayAttendanceByProjectViewModel
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectCode = project.ProjectCode,
                DayShiftCount = projectEmployees.Count(e => e.ShiftType == "Day"),
                NightShiftCount = projectEmployees.Count(e => e.ShiftType == "Night"),
                TotalCount = projectEmployees.Count
            });
        }

        dashboard.TodayAttendanceByProject = workingByProject
            .Where(p => p.TotalCount > 0)
            .OrderByDescending(p => p.TotalCount)
            .ToList();

        // 3. Thống kê số người nghỉ hôm nay theo project (phân theo ngày/đêm)
        // status = 2: nghỉ, status = 3: xin nghỉ, status = 4: di chuyển, status = 5: làm visa, status = 6: đào tạo, status = 7: mở quyền hạn
        var absentToday = todayTimesheets
            .Where(t => t.Status >= 2 && t.Status <= 7) // status = 2, 3, 4, 5, 6, 7
            .Select(t => new
            {
                Employee = t.Employee!,
                Timesheet = t
            })
            .ToList();

        var absenceByProject = new List<TodayAbsenceByProjectViewModel>();

        foreach (var project in allProjects)
        {
            var projectAbsentEmployees = absentToday
                .Where(a => a.Employee.EmployeeProjects?.Any(ep => ep.Project.ProjectCode == project.ProjectCode) == true)
                .ToList();

            // Xác định ca dựa trên work_start/work_end nếu có, nếu không thì mặc định là Day
            var dayShiftCount = projectAbsentEmployees.Count(a => 
                !IsNightShift(a.Timesheet.WorkStart, a.Timesheet.WorkEnd));
            var nightShiftCount = projectAbsentEmployees.Count(a => 
                IsNightShift(a.Timesheet.WorkStart, a.Timesheet.WorkEnd));

            absenceByProject.Add(new TodayAbsenceByProjectViewModel
            {
                ProjectId = project.ProjectId,
                ProjectName = project.ProjectName,
                ProjectCode = project.ProjectCode,
                DayShiftCount = dayShiftCount,
                NightShiftCount = nightShiftCount,
                TotalCount = projectAbsentEmployees.Count
            });
        }

        dashboard.TodayAbsenceByProject = absenceByProject
            .Where(p => p.TotalCount > 0)
            .OrderByDescending(p => p.TotalCount)
            .ToList();

        // Tổng số người nghỉ hôm nay (status = 2, 3, 4, 5, 6, 7)
        dashboard.TotalAbsentToday = todayTimesheets
            .Count(t => t.Status >= 2 && t.Status <= 7);

        return dashboard;
    }
}

