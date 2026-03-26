using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> IsUsernameExistsAsync(string username);
    Task<User?> GetByEmployeeIdAsync(int employeeId);
}

