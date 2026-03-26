using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class ExcelRepository : Repository<Excel>, IExcelRepository
{
    public ExcelRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Excel>> GetRecentUploadsAsync(int count = 10)
    {
        return await _dbSet
            .OrderByDescending(e => e.TimeUpload)
            .Take(count)
            .ToListAsync();
    }
}

