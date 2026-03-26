using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface ITimesheetRepository : IRepository<Timesheet>
{
    Task<Timesheet?> GetByEmployeeAndDayAsync(int employeeId, DateOnly day);
    Task<IEnumerable<Timesheet>> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<Timesheet>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate);
    Task<IEnumerable<Timesheet>> GetByEmployeeAndDateRangeAsync(int employeeId, DateOnly startDate, DateOnly endDate);
    Task<int> CountByEmployeeAndAbsenceTypeNullAsync(int employeeId);
    Task<int> CountByEmployeeAndAbsenceTypeAsync(int employeeId, short absenceType);
    Task<int> CountByEmployeeAndWorkTimeAsync(int employeeId);
    Task<int> CountTotalDaysByEmployeeAsync(int employeeId);
    Task<int> CountAllByEmployeeIdAsync(int employeeId);
    Task<int> CountLeaveDaysByEmployeeAsync(int employeeId);
}

