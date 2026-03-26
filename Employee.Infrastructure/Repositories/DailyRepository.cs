using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class DailyRepository : IDailyRepository
{
    private readonly EmployeeDbContext _context;

    public DailyRepository(EmployeeDbContext context)
    {
        _context = context;
    }

    public async Task<Daily?> GetByIdAsync(int id)
    {
        return await _context.Dailies
            .Include(d => d.Employee)
            .FirstOrDefaultAsync(d => d.DailyId == id);
    }

    public async Task<IEnumerable<Daily>> GetByDayAsync(DateOnly day)
    {
        return await _context.Dailies
            .Include(d => d.Employee)
            .Where(d => d.Day == day)
            .ToListAsync();
    }

    public async Task<Daily?> GetByEmployeeAndDayAsync(int employeeId, DateOnly day)
    {
        return await _context.Dailies
            .FirstOrDefaultAsync(d => d.EmployeeId == employeeId && d.Day == day);
    }

    public async Task<IEnumerable<Daily>> GetAllAsync()
    {
        return await _context.Dailies
            .Include(d => d.Employee)
            .ToListAsync();
    }

    public async Task AddAsync(Daily daily)
    {
        _context.Dailies.Add(daily);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Daily daily)
    {
        _context.Entry(daily).State = EntityState.Modified;
        daily.UpdatedAt = DateTime.Now;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Daily daily)
    {
        _context.Dailies.Remove(daily);
        await _context.SaveChangesAsync();
    }
}
