using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class TimesheetRepository : Repository<Timesheet>, ITimesheetRepository
{
    public TimesheetRepository(EmployeeDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Timesheet>> GetAllAsync()
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .ToListAsync();
    }

    public override async Task<Timesheet?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .FirstOrDefaultAsync(t => t.TimesheetId == id);
    }

    public async Task<Timesheet?> GetByEmployeeAndDayAsync(int employeeId, DateOnly day)
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .FirstOrDefaultAsync(t => t.EmployeeId == employeeId && t.Day == day);
    }

    public async Task<IEnumerable<Timesheet>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .Where(t => t.EmployeeId == employeeId)
            .OrderByDescending(t => t.Day)
            .ToListAsync();
    }

    public async Task<IEnumerable<Timesheet>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .Where(t => t.Day >= startDate && t.Day <= endDate)
            .OrderBy(t => t.Day)
            .ToListAsync();
    }

    public async Task<IEnumerable<Timesheet>> GetByEmployeeAndDateRangeAsync(int employeeId, DateOnly startDate, DateOnly endDate)
    {
        return await _dbSet
            .Include(t => t.Employee)
            .Include(t => t.Area)
            .Where(t => t.EmployeeId == employeeId && t.Day >= startDate && t.Day <= endDate)
            .OrderBy(t => t.Day)
            .ToListAsync();
    }

    public async Task<int> CountByEmployeeAndAbsenceTypeNullAsync(int employeeId)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId && t.AbsenceType == null)
            .CountAsync();
    }

    public async Task<int> CountByEmployeeAndAbsenceTypeAsync(int employeeId, short absenceType)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId && t.AbsenceType == absenceType)
            .CountAsync();
    }

    public async Task<int> CountByEmployeeAndWorkTimeAsync(int employeeId)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId && t.WorkTime != null && t.WorkTime > 0)
            .CountAsync();
    }

    public async Task<int> CountTotalDaysByEmployeeAsync(int employeeId)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId && (t.AbsenceType == null || t.AbsenceType == 0 || t.AbsenceType == 1))
            .CountAsync();
    }

    public async Task<int> CountAllByEmployeeIdAsync(int employeeId)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId)
            .CountAsync();
    }

    public async Task<int> CountLeaveDaysByEmployeeAsync(int employeeId)
    {
        return await _dbSet
            .Where(t => t.EmployeeId == employeeId && (t.AbsenceType == 0 || t.AbsenceType == 1))
            .CountAsync();
    }
}

