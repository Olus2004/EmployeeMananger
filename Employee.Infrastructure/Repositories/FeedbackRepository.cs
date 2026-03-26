using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class FeedbackRepository : Repository<Feedback>, IFeedbackRepository
{
    public FeedbackRepository(EmployeeDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Feedback>> GetAllAsync()
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();
    }

    public async Task<Feedback?> GetByIdWithNavigationAsync(int id)
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .FirstOrDefaultAsync(f => f.FeedbackId == id);
    }

    public async Task<IEnumerable<Feedback>> GetByEmployeeIdAsync(int employeeId)
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .Where(f => f.EmployeeId == employeeId)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Feedback>> GetByTimesheetIdAsync(int timesheetId)
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .Where(f => f.TimesheetId == timesheetId)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Feedback>> GetPendingFeedbacksAsync()
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .Where(f => f.StatusResponse == 3) // Đang xử lí
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Feedback>> GetRespondedFeedbacksAsync()
    {
        return await _dbSet
            .Include(f => f.Employee)
            .Include(f => f.Timesheet)
            .Where(f => f.StatusResponse == 3) // Đã hoàn thành
            .OrderByDescending(f => f.RespondedAt)
            .ToListAsync();
    }
}

