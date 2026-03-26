using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface ITimesheetService
{
    Task<IEnumerable<TimesheetViewModel>> GetAllTimesheetsAsync();
    Task<TimesheetViewModel?> GetTimesheetByIdAsync(int id);
    Task<TimesheetViewModel?> GetTimesheetByEmployeeAndDayAsync(int employeeId, DateOnly day);
    Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByDateRangeAsync(DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<TimesheetViewModel>> GetTimesheetsByEmployeeAndDateRangeAsync(int employeeId, DateOnly startDate, DateOnly endDate);
    Task<TimesheetViewModel> CreateTimesheetAsync(CreateTimesheetViewModel model);
    Task<TimesheetViewModel?> UpdateTimesheetAsync(int id, UpdateTimesheetViewModel model);
    Task<bool> DeleteTimesheetAsync(int id);
}

