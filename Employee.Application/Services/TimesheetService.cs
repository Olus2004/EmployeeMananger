using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using EmployeeModel = Employee.Core.Models.Employee;
using TimesheetModel = Employee.Core.Models.Timesheet;

namespace Employee.Application.Services;

public class TimesheetService : ITimesheetService
{
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAreaRepository _areaRepository;

    public TimesheetService(ITimesheetRepository timesheetRepository, IEmployeeRepository employeeRepository, IAreaRepository areaRepository)
    {
        _timesheetRepository = timesheetRepository;
        _employeeRepository = employeeRepository;
        _areaRepository = areaRepository;
    }

    private static string? GetDisplayEmployeeName(EmployeeModel? employee)
    {
        if (employee == null) return null;
        // Nếu fullname trống thì dùng fullnameOther, nếu cả hai đều trống thì trả về null
        if (string.IsNullOrWhiteSpace(employee.Fullname))
        {
            return string.IsNullOrWhiteSpace(employee.FullnameOther) 
                ? null 
                : employee.FullnameOther;
        }
        return employee.Fullname;
    }

    public async Task<IEnumerable<TimesheetViewModel>> GetAllTimesheetsAsync()
    {
        var timesheets = await _timesheetRepository.GetAllAsync();
        
        return timesheets.Select(t => new TimesheetViewModel
        {
            TimesheetId = t.TimesheetId,
            EmployeeId = t.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(t.Employee),
            Day = t.Day,
            DayOfWeek = t.DayOfWeek,
            WorkStart = t.WorkStart,
            WorkEnd = t.WorkEnd,
            WorkTime = CalculateWorkTime(t.WorkStart, t.WorkEnd),
            Status = t.Status,
            AbsenceType = t.AbsenceType,
            AbsenceReason = t.AbsenceReason,
            Notes = t.Notes,
            AreaId = t.AreaId,
            AreaName = t.Area?.Name
        });
    }

    public async Task<TimesheetViewModel?> GetTimesheetByIdAsync(int id)
    {
        var timesheet = await _timesheetRepository.GetByIdAsync(id);
        if (timesheet == null) return null;

        // Load navigation properties if needed
        var employee = await _employeeRepository.GetByIdAsync(timesheet.EmployeeId);

        return new TimesheetViewModel
        {
            TimesheetId = timesheet.TimesheetId,
            EmployeeId = timesheet.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(employee),
            Day = timesheet.Day,
            DayOfWeek = timesheet.DayOfWeek,
            WorkStart = timesheet.WorkStart,
            WorkEnd = timesheet.WorkEnd,
            WorkTime = CalculateWorkTime(timesheet.WorkStart, timesheet.WorkEnd),
            Status = timesheet.Status,
            AbsenceType = timesheet.AbsenceType,
            AbsenceReason = timesheet.AbsenceReason,
            Notes = timesheet.Notes,
            AreaId = timesheet.AreaId
        };
    }

    public async Task<TimesheetViewModel?> GetTimesheetByEmployeeAndDayAsync(int employeeId, DateOnly day)
    {
        var timesheet = await _timesheetRepository.GetByEmployeeAndDayAsync(employeeId, day);
        if (timesheet == null) return null;

        return new TimesheetViewModel
        {
            TimesheetId = timesheet.TimesheetId,
            EmployeeId = timesheet.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(timesheet.Employee),
            Day = timesheet.Day,
            DayOfWeek = timesheet.DayOfWeek,
            WorkTime = timesheet.WorkTime,
            Status = timesheet.Status,
            AbsenceType = timesheet.AbsenceType,
            AbsenceReason = timesheet.AbsenceReason,
            Notes = timesheet.Notes,
            AreaId = timesheet.AreaId,
            AreaName = timesheet.Area?.Name
        };
    }

    public async Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByEmployeeIdAsync(int employeeId)
    {
        var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(employeeId);
        return timesheets.Select(t => new TimesheetViewModel
        {
            TimesheetId = t.TimesheetId,
            EmployeeId = t.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(t.Employee),
            Day = t.Day,
            DayOfWeek = t.DayOfWeek,
            WorkStart = t.WorkStart,
            WorkEnd = t.WorkEnd,
            WorkTime = CalculateWorkTime(t.WorkStart, t.WorkEnd),
            Status = t.Status,
            AbsenceType = t.AbsenceType,
            AbsenceReason = t.AbsenceReason,
            Notes = t.Notes,
            AreaId = t.AreaId,
            AreaName = t.Area?.Name
        });
    }

    public async Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        var timesheets = await _timesheetRepository.GetByDateRangeAsync(startDate, endDate);
        return timesheets.Select(t => new TimesheetViewModel
        {
            TimesheetId = t.TimesheetId,
            EmployeeId = t.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(t.Employee),
            Day = t.Day,
            DayOfWeek = t.DayOfWeek,
            WorkStart = t.WorkStart,
            WorkEnd = t.WorkEnd,
            WorkTime = CalculateWorkTime(t.WorkStart, t.WorkEnd),
            Status = t.Status,
            AbsenceType = t.AbsenceType,
            AbsenceReason = t.AbsenceReason,
            Notes = t.Notes,
            AreaId = t.AreaId,
            AreaName = t.Area?.Name
        });
    }

    public async Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByEmployeeAndDateRangeAsync(int employeeId, DateOnly startDate, DateOnly endDate)
    {
        var timesheets = await _timesheetRepository.GetByEmployeeAndDateRangeAsync(employeeId, startDate, endDate);
        return timesheets.Select(t => new TimesheetViewModel
        {
            TimesheetId = t.TimesheetId,
            EmployeeId = t.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(t.Employee),
            Day = t.Day,
            DayOfWeek = t.DayOfWeek,
            WorkStart = t.WorkStart,
            WorkEnd = t.WorkEnd,
            WorkTime = CalculateWorkTime(t.WorkStart, t.WorkEnd),
            Status = t.Status,
            AbsenceType = t.AbsenceType,
            AbsenceReason = t.AbsenceReason,
            Notes = t.Notes,
            AreaId = t.AreaId,
            AreaName = t.Area?.Name
        });
    }

    public async Task<TimesheetViewModel> CreateTimesheetAsync(CreateTimesheetViewModel model)
    {
        // Kiểm tra xem đã tồn tại timesheet với cùng employee_id và day chưa
        var existingTimesheet = await _timesheetRepository.GetByEmployeeAndDayAsync(model.EmployeeId, model.Day);
        
        TimesheetModel timesheet;
        if (existingTimesheet != null)
        {
            // Nếu đã tồn tại, cập nhật bản ghi đó
            timesheet = existingTimesheet;
            timesheet.DayOfWeek = model.DayOfWeek;
            timesheet.WorkStart = model.WorkStart;
            timesheet.WorkEnd = model.WorkEnd;
            timesheet.WorkTime = CalculateWorkTime(model.WorkStart, model.WorkEnd);
            timesheet.Status = model.Status;
            timesheet.AbsenceType = model.AbsenceType;
            timesheet.AbsenceReason = model.AbsenceReason;
            timesheet.Notes = model.Notes;
            timesheet.AreaId = model.AreaId;
            
            await _timesheetRepository.UpdateAsync(timesheet);
        }
        else
        {
            // Nếu chưa tồn tại, tạo mới
            timesheet = new TimesheetModel
            {
                EmployeeId = model.EmployeeId,
                Day = model.Day,
                DayOfWeek = model.DayOfWeek,
                WorkStart = model.WorkStart,
                WorkEnd = model.WorkEnd,
                WorkTime = CalculateWorkTime(model.WorkStart, model.WorkEnd),
                Status = model.Status,
                AbsenceType = model.AbsenceType,
                AbsenceReason = model.AbsenceReason,
                Notes = model.Notes,
                AreaId = model.AreaId
            };

            await _timesheetRepository.AddAsync(timesheet);
        }

        var employee = await _employeeRepository.GetByIdAsync(model.EmployeeId);

        return new TimesheetViewModel
        {
            TimesheetId = timesheet.TimesheetId,
            EmployeeId = timesheet.EmployeeId,
            EmployeeName = GetDisplayEmployeeName(employee),
            Day = timesheet.Day,
            DayOfWeek = timesheet.DayOfWeek,
            WorkStart = timesheet.WorkStart,
            WorkEnd = timesheet.WorkEnd,
            WorkTime = CalculateWorkTime(timesheet.WorkStart, timesheet.WorkEnd),
            Status = timesheet.Status,
            AbsenceType = timesheet.AbsenceType,
            AbsenceReason = timesheet.AbsenceReason,
            Notes = timesheet.Notes,
            AreaId = timesheet.AreaId
        };
    }

    public async Task<TimesheetViewModel?> UpdateTimesheetAsync(int id, UpdateTimesheetViewModel model)
    {
        var timesheet = await _timesheetRepository.GetByIdAsync(id);
        if (timesheet == null) return null;

        timesheet.DayOfWeek = model.DayOfWeek;
        timesheet.WorkStart = model.WorkStart;
        timesheet.WorkEnd = model.WorkEnd;
        timesheet.WorkTime = CalculateWorkTime(model.WorkStart, model.WorkEnd);
        timesheet.Status = model.Status;
        timesheet.AbsenceType = model.AbsenceType;
        timesheet.AbsenceReason = model.AbsenceReason;
        timesheet.Notes = model.Notes;
        timesheet.AreaId = model.AreaId;

        await _timesheetRepository.UpdateAsync(timesheet);

        var employee = await _employeeRepository.GetByIdAsync(timesheet.EmployeeId);

        return new TimesheetViewModel
        {
            TimesheetId = timesheet.TimesheetId,
            EmployeeId = timesheet.EmployeeId,
            EmployeeName = employee?.Fullname,
            Day = timesheet.Day,
            DayOfWeek = timesheet.DayOfWeek,
            WorkStart = timesheet.WorkStart,
            WorkEnd = timesheet.WorkEnd,
            WorkTime = CalculateWorkTime(timesheet.WorkStart, timesheet.WorkEnd),
            Status = timesheet.Status,
            AbsenceType = timesheet.AbsenceType,
            AbsenceReason = timesheet.AbsenceReason,
            Notes = timesheet.Notes,
            AreaId = timesheet.AreaId
        };
    }

    public async Task<bool> DeleteTimesheetAsync(int id)
    {
        var timesheet = await _timesheetRepository.GetByIdAsync(id);
        if (timesheet == null) return false;

        await _timesheetRepository.DeleteAsync(timesheet);
        return true;
    }

    // Calculate work time in hours from work start and end times
    private static decimal? CalculateWorkTime(TimeOnly? workStart, TimeOnly? workEnd)
    {
        if (workStart == null || workEnd == null)
            return null;

        var start = workStart.Value;
        var end = workEnd.Value;

        // Handle case where end time is next day (e.g., night shift)
        TimeSpan duration;
        if (end < start)
        {
            // Work spans midnight (e.g., 22:00 to 06:00)
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
}

