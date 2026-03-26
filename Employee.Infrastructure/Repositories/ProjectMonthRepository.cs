using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Employee.Infrastructure.Repositories;

public class ProjectMonthRepository : IProjectMonthRepository
{
    private readonly EmployeeDbContext _context;

    public ProjectMonthRepository(EmployeeDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectMonth>> GetByProjectAndMonthAsync(int projectId, DateOnly month)
    {
        return await _context.ProjectMonths
            .Include(pm => pm.Employee)
            .Where(pm => pm.ProjectId == projectId && pm.Month == month)
            .ToListAsync();
    }

    public async Task<int> CountDistinctEmployeesByProjectAndMonthAsync(int projectId, DateOnly month)
    {
        return await _context.ProjectMonths
            .Where(pm => pm.ProjectId == projectId && pm.Month == month)
            .Select(pm => pm.EmployeeId)
            .Distinct()
            .CountAsync();
    }

    public async Task<Dictionary<int, int>> CountDistinctEmployeesByProjectIdsAndMonthAsync(IEnumerable<int> projectIds, DateOnly month)
    {
        return await _context.ProjectMonths
            .Where(pm => projectIds.Contains(pm.ProjectId) && pm.Month == month)
            .GroupBy(pm => pm.ProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Select(x => x.EmployeeId).Distinct().Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count);
    }

    public async Task<ProjectMonth?> GetAsync(int projectId, int employeeId, DateOnly month)
    {
        return await _context.ProjectMonths
            .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.EmployeeId == employeeId && pm.Month == month);
    }

    public async Task<IEnumerable<ProjectMonth>> GetByMonthAsync(DateOnly month)
    {
        return await _context.ProjectMonths
            .Include(pm => pm.Project)
            .Include(pm => pm.Employee)
            .Where(pm => pm.Month == month)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectMonth>> GetByEmployeeAndMonthAsync(int employeeId, DateOnly month)
    {
        return await _context.ProjectMonths
            .Include(pm => pm.Project)
            .Where(pm => pm.EmployeeId == employeeId && pm.Month == month)
            .ToListAsync();
    }

    public async Task AddAsync(ProjectMonth projectMonth)
    {
        _context.ProjectMonths.Add(projectMonth);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ProjectMonth projectMonth)
    {
        _context.ProjectMonths.Remove(projectMonth);
        await _context.SaveChangesAsync();
    }
}
