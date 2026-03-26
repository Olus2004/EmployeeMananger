using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IProjectMonthRepository
{
    Task<IEnumerable<ProjectMonth>> GetByProjectAndMonthAsync(int projectId, DateOnly month);
    Task<int> CountDistinctEmployeesByProjectAndMonthAsync(int projectId, DateOnly month);
    Task<Dictionary<int, int>> CountDistinctEmployeesByProjectIdsAndMonthAsync(IEnumerable<int> projectIds, DateOnly month);
    Task<ProjectMonth?> GetAsync(int projectId, int employeeId, DateOnly month);
    Task<IEnumerable<ProjectMonth>> GetByMonthAsync(DateOnly month);
    Task<IEnumerable<ProjectMonth>> GetByEmployeeAndMonthAsync(int employeeId, DateOnly month);
    Task AddAsync(ProjectMonth projectMonth);
    Task DeleteAsync(ProjectMonth projectMonth);
}
