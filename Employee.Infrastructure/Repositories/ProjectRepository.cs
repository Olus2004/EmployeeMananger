using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class ProjectRepository : Repository<Project>, IProjectRepository
{
    public ProjectRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<Project?> GetByProjectCodeAsync(string projectCode)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.ProjectCode == projectCode);
    }

    public async Task<IEnumerable<Project>> GetAllProjectsAsync()
    {
        return await _dbSet
            .OrderBy(p => p.ProjectName)
            .ToListAsync();
    }
}

