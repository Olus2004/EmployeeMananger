using Microsoft.EntityFrameworkCore;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Employee.Infrastructure.Data;

namespace Employee.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(EmployeeDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<bool> IsUsernameExistsAsync(string username)
    {
        return await _dbSet
            .AnyAsync(u => u.Username == username);
    }

    public async Task<User?> GetByEmployeeIdAsync(int employeeId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
    }
}

