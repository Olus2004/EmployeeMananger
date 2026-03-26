using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class BackupRepository : Repository<Backup>, IBackupRepository
{
    public BackupRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Backup>> GetAllOrderedByDateDescAsync()
    {
        return await _dbSet
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }
}

