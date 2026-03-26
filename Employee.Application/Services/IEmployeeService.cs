using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeViewModel>> GetAllEmployeesAsync();
    Task<IEnumerable<EmployeeViewModel>> GetActiveEmployeesAsync();
    Task<IEnumerable<EmployeeViewModel>> GetEmployeesByAreaIdAsync(int areaId);
    Task<IEnumerable<EmployeeViewModel>> GetEmployeesByTypeAsync(short type);
    Task<EmployeeViewModel?> GetEmployeeByIdAsync(int id, DateOnly? month = null);
    Task<EmployeeViewModel> CreateEmployeeAsync(CreateEmployeeViewModel model, DateOnly? month = null);
    Task<EmployeeViewModel?> UpdateEmployeeAsync(int id, UpdateEmployeeViewModel model, DateOnly? month = null);
    Task<bool> DeleteEmployeeAsync(int id);
    Task<bool> RecalculateEmployeeStatsAsync(int employeeId);
    
    // Project Month management for Employee
    Task<IEnumerable<ProjectViewModel>> GetEmployeeProjectsByMonthAsync(int employeeId, DateOnly month);
    Task AddProjectToEmployeeMonthAsync(int employeeId, int projectId, DateOnly month);
    Task RemoveProjectFromEmployeeMonthAsync(int employeeId, int projectId, DateOnly month);
}

