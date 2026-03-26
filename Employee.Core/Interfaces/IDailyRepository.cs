using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IDailyRepository
{
    Task<Daily?> GetByIdAsync(int id);
    Task<IEnumerable<Daily>> GetByDayAsync(DateOnly day);
    Task<Daily?> GetByEmployeeAndDayAsync(int employeeId, DateOnly day);
    Task<IEnumerable<Daily>> GetAllAsync();
    Task AddAsync(Daily daily);
    Task UpdateAsync(Daily daily);
    Task DeleteAsync(Daily daily);
}
