using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class AreaRepository : Repository<Area>, IAreaRepository
{
    public AreaRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Area>> GetActiveAreasAsync()
    {
        return await _dbSet
            .Where(a => a.Active == 1)
            .OrderBy(a => a.Name)
            .ToListAsync();
    }
}

