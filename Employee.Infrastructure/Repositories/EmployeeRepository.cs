using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using EmployeeModel = Employee.Core.Models.Employee;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class EmployeeRepository : Repository<EmployeeModel>, IEmployeeRepository
{
    public EmployeeRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<EmployeeModel>> GetByAreaIdAsync(int areaId)
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .Where(e => e.AreaId == areaId)
            .ToListAsync();
    }

    public async Task<IEnumerable<EmployeeModel>> GetByTypeAsync(short type)
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .Where(e => e.Type == type)
            .ToListAsync();
    }

    public async Task<IEnumerable<EmployeeModel>> GetActiveEmployeesAsync()
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .Where(e => e.Active == 1)
            .ToListAsync();
    }

    public async Task<EmployeeModel?> GetWithAreaAsync(int employeeId)
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
    }

    public override async Task<IEnumerable<EmployeeModel>> GetAllAsync()
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .ToListAsync();
    }

    public override async Task<EmployeeModel?> GetByIdAsync(int id)
    {
        return await _dbSet
            .Include(e => e.Area)
            .Include(e => e.EmployeeProjects)
                .ThenInclude(ep => ep.Project)
            .FirstOrDefaultAsync(e => e.EmployeeId == id);
    }
}

