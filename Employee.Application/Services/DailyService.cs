using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;

namespace Employee.Application.Services;

public class DailyService : IDailyService
{
    private readonly IDailyRepository _dailyRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IProjectMonthRepository _projectMonthRepository;

    public DailyService(
        IDailyRepository dailyRepository, 
        IEmployeeRepository employeeRepository,
        ITimesheetRepository timesheetRepository,
        IProjectMonthRepository projectMonthRepository)
    {
        _dailyRepository = dailyRepository;
        _employeeRepository = employeeRepository;
        _timesheetRepository = timesheetRepository;
        _projectMonthRepository = projectMonthRepository;
    }

    public async Task<DailyViewModel?> GetDailyByIdAsync(int id)
    {
        var daily = await _dailyRepository.GetByIdAsync(id);
        if (daily == null) return null;
        return MapToViewModel(daily);
    }

    public async Task<IEnumerable<DailyViewModel>> GetDailiesByDayAsync(DateOnly day)
    {
        var dailies = await _dailyRepository.GetByDayAsync(day);
        var viewModels = dailies.Select(MapToViewModel).ToList();
        
        var firstDayOfMonth = new DateOnly(day.Year, day.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(firstDayOfMonth);
        
        foreach (var vm in viewModels)
        {
            vm.ProjectCodes = projectMonths
                .Where(pm => pm.EmployeeId == vm.EmployeeId && pm.Project != null)
                .Select(pm => pm.Project.ProjectCode!)
                .ToList();
        }
        
        return viewModels;
    }

    public async Task<DailyViewModel> CreateDailyAsync(CreateDailyViewModel model)
    {
        var day = DateOnly.Parse(model.Day ?? DateTime.Now.ToString("yyyy-MM-dd"));
        
        // Check if already exists
        var existing = await _dailyRepository.GetByEmployeeAndDayAsync(model.EmployeeId, day);
        if (existing != null)
        {
            return MapToViewModel(existing);
        }

        var employee = await _employeeRepository.GetWithAreaAsync(model.EmployeeId);
        if (employee == null) throw new Exception("Không tìm thấy nhân viên");

        var daily = new Daily
        {
            EmployeeId = model.EmployeeId,
            Day = day,
            Fullname = employee.Fullname,
            AreaName = employee.Area?.Name,
            Status = model.Status,
            WorkStart = !string.IsNullOrEmpty(model.WorkStart) ? TimeOnly.Parse(model.WorkStart) : null,
            WorkEnd = !string.IsNullOrEmpty(model.WorkEnd) ? TimeOnly.Parse(model.WorkEnd) : null,
            SkillLv = employee.SkillLv,
            SkillNote = employee.SkillNote,
            TimeTest = employee.TimeTest,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        await _dailyRepository.AddAsync(daily);
        return MapToViewModel(daily);
    }

    public async Task<DailyViewModel?> UpdateDailyAsync(int id, UpdateDailyViewModel model)
    {
        var daily = await _dailyRepository.GetByIdAsync(id);
        if (daily == null) return null;

        daily.Status = model.Status;
        daily.WorkStart = !string.IsNullOrEmpty(model.WorkStart) ? TimeOnly.Parse(model.WorkStart) : null;
        daily.WorkEnd = !string.IsNullOrEmpty(model.WorkEnd) ? TimeOnly.Parse(model.WorkEnd) : null;
        
        if (model.SkillLv.HasValue) daily.SkillLv = model.SkillLv.Value;
        if (model.SkillNote != null) daily.SkillNote = model.SkillNote;
        if (model.TimeTest.HasValue) daily.TimeTest = model.TimeTest.Value;
        
        daily.UpdatedAt = DateTime.Now;

        await _dailyRepository.UpdateAsync(daily);
        return MapToViewModel(daily);
    }

    public async Task<bool> DeleteDailyAsync(int id)
    {
        var daily = await _dailyRepository.GetByIdAsync(id);
        if (daily == null) return false;
        await _dailyRepository.DeleteAsync(daily);
        return true;
    }

    public async Task<IEnumerable<DailyViewModel>> GetInitialDailyListAsync(DateOnly day)
    {
        // Get all active employees
        var employees = await _employeeRepository.GetActiveEmployeesAsync();
        var result = new List<DailyViewModel>();
        
        var firstDayOfMonth = new DateOnly(day.Year, day.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(firstDayOfMonth);

        foreach (var emp in employees)
        {
            var daily = await _dailyRepository.GetByEmployeeAndDayAsync(emp.EmployeeId, day);
            if (daily == null)
            {
                // Auto-create for the day
                daily = new Daily
                {
                    EmployeeId = emp.EmployeeId,
                    Day = day,
                    Fullname = emp.Fullname,
                    AreaName = emp.Area?.Name,
                    Status = 0, // Mặc định là 'Trống' (Chờ điểm danh)
                    SkillLv = emp.SkillLv,
                    SkillNote = emp.SkillNote,
                    TimeTest = emp.TimeTest,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                await _dailyRepository.AddAsync(daily);
            }
            var vm = MapToViewModel(daily);
            vm.ProjectCodes = projectMonths
                .Where(pm => pm.EmployeeId == emp.EmployeeId && pm.Project != null)
                .Select(pm => pm.Project.ProjectCode!)
                .ToList();
            result.Add(vm);
        }
        return result;
    }

    public async Task<DailyStatsViewModel> GetMonthlyStatsAsync(DateOnly day)
    {
        var firstDayOfMonth = new DateOnly(day.Year, day.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(firstDayOfMonth);
        
        // Count distinct employees by type
        var distinctEmployees = projectMonths
            .Where(pm => pm.Employee != null)
            .Select(pm => pm.Employee)
            .GroupBy(e => e.EmployeeId)
            .Select(g => g.First())
            .ToList();

        return new DailyStatsViewModel
        {
            VNCount = distinctEmployees.Count(e => e.Type == 1),
            CNCount = distinctEmployees.Count(e => e.Type == 2),
            MonthDisplay = day.ToString("MM/yyyy")
        };
    }

    public async Task<bool> SyncToTimesheetAsync(int dailyId)
    {
        var daily = await _dailyRepository.GetByIdAsync(dailyId);
        if (daily == null) return false;

        // 1. Update/Add to Timesheet
        var timesheet = await _timesheetRepository.GetByEmployeeAndDayAsync(daily.EmployeeId, daily.Day);
        if (timesheet == null)
        {
            // Get employee to find original AreaId if needed, but daily has it too?
            // Wait, daily only has AreaName (snapshot). Let's get actual Employee to get AreaId.
            var employeeInfo = await _employeeRepository.GetByIdAsync(daily.EmployeeId);
            
            timesheet = new Timesheet
            {
                EmployeeId = daily.EmployeeId,
                Day = daily.Day,
                DayOfWeek = (byte)daily.Day.DayOfWeek == 0 ? (byte)7 : (byte)daily.Day.DayOfWeek,
                AreaId = employeeInfo?.AreaId, // Fallback to current employee area
                Status = daily.Status,
                WorkStart = daily.WorkStart,
                WorkEnd = daily.WorkEnd,
                WorkTime = CalculateWorkTime(daily.WorkStart, daily.WorkEnd),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            await _timesheetRepository.AddAsync(timesheet);
        }
        else
        {
            timesheet.Status = daily.Status;
            timesheet.WorkStart = daily.WorkStart;
            timesheet.WorkEnd = daily.WorkEnd;
            timesheet.WorkTime = CalculateWorkTime(daily.WorkStart, daily.WorkEnd);
            timesheet.UpdatedAt = DateTime.Now;
            // Optionally update AreaId if specifically requested, 
            // the user said "update vào tương ứng các trường area_id, status, work_start và work_end"
            // So let's get the area_id from employee if possible or just keep current.
            var employeeInfo = await _employeeRepository.GetByIdAsync(daily.EmployeeId);
            if (employeeInfo != null) timesheet.AreaId = employeeInfo.AreaId;

            await _timesheetRepository.UpdateAsync(timesheet);
        }

        // 2. Update Employee Skill Info
        var employee = await _employeeRepository.GetByIdAsync(daily.EmployeeId);
        if (employee != null)
        {
            employee.SkillLv = daily.SkillLv;
            employee.SkillNote = daily.SkillNote;
            employee.TimeTest = daily.TimeTest;
            employee.UpdatedAt = DateTime.Now;
            await _employeeRepository.UpdateAsync(employee);
        }

        return true;
    }

    private decimal? CalculateWorkTime(TimeOnly? workStart, TimeOnly? workEnd)
    {
        if (workStart == null || workEnd == null)
            return null;

        var start = workStart.Value;
        var end = workEnd.Value;

        TimeSpan duration;
        if (end < start)
        {
            var hoursUntilMidnight = 24 - start.Hour - (start.Minute / 60.0) - (start.Second / 3600.0);
            var hoursAfterMidnight = end.Hour + (end.Minute / 60.0) + (end.Second / 3600.0);
            duration = TimeSpan.FromHours(hoursUntilMidnight + hoursAfterMidnight);
        }
        else
        {
            var startTotalMinutes = start.Hour * 60 + start.Minute + (start.Second / 60.0);
            var endTotalMinutes = end.Hour * 60 + end.Minute + (end.Second / 60.0);
            duration = TimeSpan.FromMinutes(endTotalMinutes - startTotalMinutes);
        }

        return (decimal)Math.Round(duration.TotalHours, 2);
    }

    private DailyViewModel MapToViewModel(Daily daily)
    {
        return new DailyViewModel
        {
            DailyId = daily.DailyId,
            EmployeeId = daily.EmployeeId,
            Day = daily.Day.ToString("yyyy-MM-dd"),
            Fullname = daily.Fullname,
            AreaName = daily.AreaName,
            Status = daily.Status,
            StatusText = GetStatusText(daily.Status),
            WorkStart = daily.WorkStart?.ToString("HH:mm"),
            WorkEnd = daily.WorkEnd?.ToString("HH:mm"),
            SkillLv = daily.SkillLv,
            SkillNote = daily.SkillNote,
            TimeTest = daily.TimeTest
        };
    }

    private string GetStatusText(short status)
    {
        return status switch
        {
            0 => "trống",
            1 => "làm",
            2 => "nghỉ",
            3 => "xin nghỉ",
            4 => "di chuyển",
            5 => "làm visa",
            6 => "đào tạo",
            7 => "mở quyền hạn",
            _ => "khác"
        };
    }
}
