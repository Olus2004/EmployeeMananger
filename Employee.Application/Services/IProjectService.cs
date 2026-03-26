using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectViewModel>> GetAllProjectsAsync();
    Task<IEnumerable<ProjectViewModel>> GetAllProjectsWithMonthlyCountAsync(DateOnly month);
    Task<ProjectViewModel?> GetProjectByIdAsync(int id);
    Task<ProjectViewModel> CreateProjectAsync(CreateProjectViewModel model);
    Task<ProjectViewModel?> UpdateProjectAsync(int id, UpdateProjectViewModel model);
    Task<bool> DeleteProjectAsync(int id);
    Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAsync(int projectId);
    Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAndDateAsync(int projectId, DateOnly date);
    Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAndDateWithStatusAsync(int projectId, DateOnly date, short? status = null);
    // Project Month methods
    Task<IEnumerable<EmployeeViewModel>> GetProjectMonthEmployeesAsync(int projectId, DateOnly month);
    Task AddEmployeeToProjectMonthAsync(int projectId, int employeeId, DateOnly month);
    Task RemoveEmployeeFromProjectMonthAsync(int projectId, int employeeId, DateOnly month);
}

