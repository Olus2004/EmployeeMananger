using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Microsoft.EntityFrameworkCore;
using Employee.Infrastructure.Data;

namespace Employee.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IEmployeeService _employeeService;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IProjectMonthRepository _projectMonthRepository;
    private readonly EmployeeDbContext _context;

    public ProjectService(IProjectRepository projectRepository, IEmployeeService employeeService, ITimesheetRepository timesheetRepository, IProjectMonthRepository projectMonthRepository, EmployeeDbContext context)
    {
        _projectRepository = projectRepository;
        _employeeService = employeeService;
        _timesheetRepository = timesheetRepository;
        _projectMonthRepository = projectMonthRepository;
        _context = context;
    }

    public async Task<IEnumerable<ProjectViewModel>> GetAllProjectsAsync()
    {
        var projects = await _projectRepository.GetAllProjectsAsync();
        
        // Đếm số lượng nhân viên cho mỗi project
        var projectIds = projects.Select(p => p.ProjectId).ToList();
        var employeeCounts = await _context.EmployeeProjects
            .Where(ep => projectIds.Contains(ep.ProjectId))
            .GroupBy(ep => ep.ProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

        return projects.Select(p => new ProjectViewModel
        {
            ProjectId = p.ProjectId,
            ProjectName = p.ProjectName,
            ProjectCode = p.ProjectCode,
            ProjectDescription = p.ProjectDescription,
            EmployeeCount = employeeCounts.GetValueOrDefault(p.ProjectId, 0),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });
    }

    public async Task<IEnumerable<ProjectViewModel>> GetAllProjectsWithMonthlyCountAsync(DateOnly month)
    {
        var projects = await _projectRepository.GetAllProjectsAsync();
        var projectIds = projects.Select(p => p.ProjectId).ToList();

        // Đếm số nhân viên distinct trong project_month cho tháng được chỉ định
        var monthlyCounts = await _projectMonthRepository.CountDistinctEmployeesByProjectIdsAndMonthAsync(projectIds, month);

        return projects.Select(p => new ProjectViewModel
        {
            ProjectId = p.ProjectId,
            ProjectName = p.ProjectName,
            ProjectCode = p.ProjectCode,
            ProjectDescription = p.ProjectDescription,
            EmployeeCount = 0,
            MonthlyEmployeeCount = monthlyCounts.GetValueOrDefault(p.ProjectId, 0),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });
    }

    public async Task<ProjectViewModel?> GetProjectByIdAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null) return null;

        // Đếm số lượng nhân viên
        var employeeCount = await _context.EmployeeProjects
            .CountAsync(ep => ep.ProjectId == id);

        return new ProjectViewModel
        {
            ProjectId = project.ProjectId,
            ProjectName = project.ProjectName,
            ProjectCode = project.ProjectCode,
            ProjectDescription = project.ProjectDescription,
            EmployeeCount = employeeCount,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        };
    }

    public async Task<ProjectViewModel> CreateProjectAsync(CreateProjectViewModel model)
    {
        // Kiểm tra project code đã tồn tại chưa
        var existingProject = await _projectRepository.GetByProjectCodeAsync(model.ProjectCode);
        if (existingProject != null)
        {
            throw new InvalidOperationException($"Mã dự án '{model.ProjectCode}' đã tồn tại");
        }

        var project = new Project
        {
            ProjectName = model.ProjectName,
            ProjectCode = model.ProjectCode,
            ProjectDescription = model.ProjectDescription
        };

        await _projectRepository.AddAsync(project);

        return new ProjectViewModel
        {
            ProjectId = project.ProjectId,
            ProjectName = project.ProjectName,
            ProjectCode = project.ProjectCode,
            ProjectDescription = project.ProjectDescription,
            EmployeeCount = 0,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        };
    }

    public async Task<ProjectViewModel?> UpdateProjectAsync(int id, UpdateProjectViewModel model)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null) return null;

        // Kiểm tra project code đã tồn tại chưa (trừ project hiện tại)
        if (project.ProjectCode != model.ProjectCode)
        {
            var existingProject = await _projectRepository.GetByProjectCodeAsync(model.ProjectCode);
            if (existingProject != null && existingProject.ProjectId != id)
            {
                throw new InvalidOperationException($"Mã dự án '{model.ProjectCode}' đã tồn tại");
            }
        }

        project.ProjectName = model.ProjectName;
        project.ProjectCode = model.ProjectCode;
        project.ProjectDescription = model.ProjectDescription;
        project.UpdatedAt = DateTime.Now;

        await _projectRepository.UpdateAsync(project);

        // Đếm số lượng nhân viên
        var employeeCount = await _context.EmployeeProjects
            .CountAsync(ep => ep.ProjectId == id);

        return new ProjectViewModel
        {
            ProjectId = project.ProjectId,
            ProjectName = project.ProjectName,
            ProjectCode = project.ProjectCode,
            ProjectDescription = project.ProjectDescription,
            EmployeeCount = employeeCount,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt
        };
    }

    public async Task<bool> DeleteProjectAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null) return false;

        // Kiểm tra xem có nhân viên nào đang thuộc project này không
        var hasEmployees = await _context.EmployeeProjects
            .AnyAsync(ep => ep.ProjectId == id);
        
        if (hasEmployees)
        {
            throw new InvalidOperationException("Không thể xóa dự án vì còn nhân viên đang thuộc dự án này");
        }

        await _projectRepository.DeleteAsync(project);
        return true;
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAsync(int projectId)
    {
        // Lấy danh sách employee IDs thuộc project
        var employeeIds = await _context.EmployeeProjects
            .Where(ep => ep.ProjectId == projectId)
            .Select(ep => ep.EmployeeId)
            .ToListAsync();

        if (employeeIds.Count == 0)
        {
            return Enumerable.Empty<EmployeeViewModel>();
        }

        // Lấy thông tin đầy đủ của các employees
        var allEmployees = await _employeeService.GetAllEmployeesAsync();
        return allEmployees.Where(e => employeeIds.Contains(e.EmployeeId));
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAndDateAsync(int projectId, DateOnly date)
    {
        // Lấy danh sách employee IDs thuộc project
        var employeeIds = await _context.EmployeeProjects
            .Where(ep => ep.ProjectId == projectId)
            .Select(ep => ep.EmployeeId)
            .ToListAsync();

        if (employeeIds.Count == 0)
        {
            return Enumerable.Empty<EmployeeViewModel>();
        }

        // Lấy danh sách employee IDs có timesheet ngày hôm nay
        var todayTimesheets = await _timesheetRepository.GetByDateRangeAsync(date, date);
        var todayEmployeeIds = todayTimesheets
            .Where(t => employeeIds.Contains(t.EmployeeId))
            .Select(t => t.EmployeeId)
            .Distinct()
            .ToList();

        if (todayEmployeeIds.Count == 0)
        {
            return Enumerable.Empty<EmployeeViewModel>();
        }

        // Lấy thông tin đầy đủ của các employees
        var allEmployees = await _employeeService.GetAllEmployeesAsync();
        return allEmployees.Where(e => todayEmployeeIds.Contains(e.EmployeeId));
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByProjectIdAndDateWithStatusAsync(int projectId, DateOnly date, short? status = null)
    {
        // Lấy danh sách employee IDs thuộc project
        var employeeIds = await _context.EmployeeProjects
            .Where(ep => ep.ProjectId == projectId)
            .Select(ep => ep.EmployeeId)
            .ToListAsync();

        if (employeeIds.Count == 0)
        {
            return Enumerable.Empty<EmployeeViewModel>();
        }

        // Lấy danh sách timesheets ngày hôm nay
        var todayTimesheets = await _timesheetRepository.GetByDateRangeAsync(date, date);
        
        // Lọc theo status nếu có
        var filteredTimesheets = todayTimesheets
            .Where(t => employeeIds.Contains(t.EmployeeId));
        
        if (status.HasValue)
        {
            filteredTimesheets = filteredTimesheets.Where(t => t.Status == status.Value);
        }
        else
        {
            // Nếu không có status, lấy tất cả status khác 1 (nghỉ)
            filteredTimesheets = filteredTimesheets.Where(t => t.Status != 1);
        }
        
        var todayEmployeeIds = filteredTimesheets
            .Select(t => t.EmployeeId)
            .Distinct()
            .ToList();

        if (todayEmployeeIds.Count == 0)
        {
            return Enumerable.Empty<EmployeeViewModel>();
        }

        // Lấy thông tin đầy đủ của các employees
        var allEmployees = await _employeeService.GetAllEmployeesAsync();
        return allEmployees.Where(e => todayEmployeeIds.Contains(e.EmployeeId));
    }

    // ==================== Project Month Methods ====================

    public async Task<IEnumerable<EmployeeViewModel>> GetProjectMonthEmployeesAsync(int projectId, DateOnly month)
    {
        var projectMonths = await _projectMonthRepository.GetByProjectAndMonthAsync(projectId, month);
        var employeeIds = projectMonths.Select(pm => pm.EmployeeId).Distinct().ToList();

        if (employeeIds.Count == 0)
            return Enumerable.Empty<EmployeeViewModel>();

        var allEmployees = await _employeeService.GetAllEmployeesAsync();
        return allEmployees.Where(e => employeeIds.Contains(e.EmployeeId));
    }

    public async Task AddEmployeeToProjectMonthAsync(int projectId, int employeeId, DateOnly month)
    {
        // 1 Nhân viên = 1 Dự án mỗi tháng. Xóa các phân công dự án khác của nhân viên trong tháng này
        var existingAssignments = await _projectMonthRepository.GetByEmployeeAndMonthAsync(employeeId, month);
        
        if (existingAssignments.Any(x => x.ProjectId == projectId))
            throw new InvalidOperationException("Nhân viên đã được thêm vào dự án trong tháng này");

        foreach (var assignment in existingAssignments)
        {
            await _projectMonthRepository.DeleteAsync(assignment);
        }

        var projectMonth = new ProjectMonth
        {
            ProjectId = projectId,
            EmployeeId = employeeId,
            Month = month
        };
        await _projectMonthRepository.AddAsync(projectMonth);
    }

    public async Task RemoveEmployeeFromProjectMonthAsync(int projectId, int employeeId, DateOnly month)
    {
        var existing = await _projectMonthRepository.GetAsync(projectId, employeeId, month);
        if (existing == null)
            throw new InvalidOperationException("Không tìm thấy nhân viên trong dự án tháng này");

        await _projectMonthRepository.DeleteAsync(existing);
    }
}

