using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using EmployeeModel = Employee.Core.Models.Employee;

namespace Employee.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IProjectMonthRepository _projectMonthRepository;
    private readonly Employee.Infrastructure.Data.EmployeeDbContext _context;

    public EmployeeService(
        IEmployeeRepository employeeRepository, 
        ITimesheetRepository timesheetRepository,
        IProjectRepository projectRepository,
        IProjectMonthRepository projectMonthRepository,
        Employee.Infrastructure.Data.EmployeeDbContext context)
    {
        _employeeRepository = employeeRepository;
        _timesheetRepository = timesheetRepository;
        _projectRepository = projectRepository;
        _projectMonthRepository = projectMonthRepository;
        _context = context;
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetAllEmployeesAsync()
    {
        var employees = await _employeeRepository.GetAllAsync();
        var employeeIds = employees.Select(e => e.EmployeeId).ToList();
        
        // Load all timesheets for all employees
        var allTimesheets = new List<Employee.Core.Models.Timesheet>();
        foreach (var empId in employeeIds)
        {
            var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(empId);
            allTimesheets.AddRange(timesheets);
        }

        var currentMonth = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(currentMonth);

        return employees.Select(e =>
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == e.EmployeeId).ToList();
            var totalWorkTime = CalculateTotalWorkTime(employeeTimesheets);
            var totalDays = employeeTimesheets.Count; // Tổng ngày = số lần employee_id xuất hiện trong timesheet
            var workDays = employeeTimesheets.Count(t => t.AbsenceType == null); // Ngày làm = đếm timesheet có absence_type = null
            // Ngày nghỉ = đếm số lượng các trường có giá trị >= 1 trong: travel_days, leave_days, unauthorized_leave, visa_extension, permission_granted, training_days
            var leaveDays = CountLeaveDays(e);
            
            return new EmployeeViewModel
            {
                EmployeeId = e.EmployeeId,
                Fullname = e.Fullname,
                FullnameOther = e.FullnameOther,
                Type = e.Type,
                Active = e.Active,
                SkillLv = e.SkillLv,
                SkillNote = e.SkillNote,
                TimeTest = e.TimeTest,
                ProjectCodes = projectMonths.Where(pm => pm.EmployeeId == e.EmployeeId && pm.Project != null).Select(pm => pm.Project.ProjectCode!).ToList(),
                Sale = e.Sale,
                WorkDays = workDays,
                TravelDays = e.TravelDays,
                LeaveDays = leaveDays,
                UnauthorizedLeave = e.UnauthorizedLeave,
                VisaExtension = e.VisaExtension,
                PermissionGranted = e.PermissionGranted,
                NightShiftDays = e.NightShiftDays,
                TrainingDays = e.TrainingDays,
                TotalDays = totalDays,
                TotalWorkTime = totalWorkTime,
                AreaId = e.AreaId,
                AreaName = e.Area?.Name,
                PlantName = e.PlantName
            };
        });
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetActiveEmployeesAsync()
    {
        var employees = await _employeeRepository.GetActiveEmployeesAsync();
        var employeeIds = employees.Select(e => e.EmployeeId).ToList();
        
        // Load all timesheets for all employees
        var allTimesheets = new List<Employee.Core.Models.Timesheet>();
        foreach (var empId in employeeIds)
        {
            var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(empId);
            allTimesheets.AddRange(timesheets);
        }

        var currentMonth = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(currentMonth);

        return employees.Select(e =>
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == e.EmployeeId).ToList();
            var totalWorkTime = CalculateTotalWorkTime(employeeTimesheets);
            var totalDays = employeeTimesheets.Count; // Tổng ngày = số lần employee_id xuất hiện trong timesheet
            var workDays = employeeTimesheets.Count(t => t.AbsenceType == null); // Ngày làm = đếm timesheet có absence_type = null
            // Ngày nghỉ = đếm số lượng các trường có giá trị >= 1 trong: travel_days, leave_days, unauthorized_leave, visa_extension, permission_granted, training_days
            var leaveDays = CountLeaveDays(e);
            
            return new EmployeeViewModel
            {
                EmployeeId = e.EmployeeId,
                Fullname = e.Fullname,
                FullnameOther = e.FullnameOther,
                Type = e.Type,
                Active = e.Active,
                SkillLv = e.SkillLv,
                SkillNote = e.SkillNote,
                TimeTest = e.TimeTest,
                ProjectCodes = projectMonths.Where(pm => pm.EmployeeId == e.EmployeeId && pm.Project != null).Select(pm => pm.Project.ProjectCode!).ToList(),
                Sale = e.Sale,
                WorkDays = workDays,
                TravelDays = e.TravelDays,
                LeaveDays = leaveDays,
                UnauthorizedLeave = e.UnauthorizedLeave,
                VisaExtension = e.VisaExtension,
                PermissionGranted = e.PermissionGranted,
                NightShiftDays = e.NightShiftDays,
                TrainingDays = e.TrainingDays,
                TotalDays = totalDays,
                TotalWorkTime = totalWorkTime,
                AreaId = e.AreaId,
                AreaName = e.Area?.Name,
                PlantName = e.PlantName
            };
        });
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByAreaIdAsync(int areaId)
    {
        var employees = await _employeeRepository.GetByAreaIdAsync(areaId);
        var employeeIds = employees.Select(e => e.EmployeeId).ToList();
        
        // Load all timesheets for all employees
        var allTimesheets = new List<Employee.Core.Models.Timesheet>();
        foreach (var empId in employeeIds)
        {
            var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(empId);
            allTimesheets.AddRange(timesheets);
        }

        var currentMonth = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(currentMonth);

        return employees.Select(e =>
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == e.EmployeeId).ToList();
            var totalWorkTime = CalculateTotalWorkTime(employeeTimesheets);
            var totalDays = employeeTimesheets.Count; // Tổng ngày = số lần employee_id xuất hiện trong timesheet
            var workDays = employeeTimesheets.Count(t => t.AbsenceType == null); // Ngày làm = đếm timesheet có absence_type = null
            // Ngày nghỉ = đếm số lượng các trường có giá trị >= 1 trong: travel_days, leave_days, unauthorized_leave, visa_extension, permission_granted, training_days
            var leaveDays = CountLeaveDays(e);
            
            return new EmployeeViewModel
            {
                EmployeeId = e.EmployeeId,
                Fullname = e.Fullname,
                FullnameOther = e.FullnameOther,
                Type = e.Type,
                Active = e.Active,
                SkillLv = e.SkillLv,
                SkillNote = e.SkillNote,
                TimeTest = e.TimeTest,
                ProjectCodes = projectMonths.Where(pm => pm.EmployeeId == e.EmployeeId && pm.Project != null).Select(pm => pm.Project.ProjectCode!).ToList(),
                Sale = e.Sale,
                WorkDays = workDays,
                TravelDays = e.TravelDays,
                LeaveDays = leaveDays,
                UnauthorizedLeave = e.UnauthorizedLeave,
                VisaExtension = e.VisaExtension,
                PermissionGranted = e.PermissionGranted,
                NightShiftDays = e.NightShiftDays,
                TrainingDays = e.TrainingDays,
                TotalDays = totalDays,
                TotalWorkTime = totalWorkTime,
                AreaId = e.AreaId,
                AreaName = e.Area?.Name,
                PlantName = e.PlantName
            };
        });
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByTypeAsync(short type)
    {
        var employees = await _employeeRepository.GetByTypeAsync(type);
        var employeeIds = employees.Select(e => e.EmployeeId).ToList();
        
        // Load all timesheets for all employees
        var allTimesheets = new List<Employee.Core.Models.Timesheet>();
        foreach (var empId in employeeIds)
        {
            var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(empId);
            allTimesheets.AddRange(timesheets);
        }

        var currentMonth = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var projectMonths = await _projectMonthRepository.GetByMonthAsync(currentMonth);

        return employees.Select(e =>
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == e.EmployeeId).ToList();
            var totalWorkTime = CalculateTotalWorkTime(employeeTimesheets);
            var totalDays = employeeTimesheets.Count; // Tổng ngày = số lần employee_id xuất hiện trong timesheet
            var workDays = employeeTimesheets.Count(t => t.AbsenceType == null); // Ngày làm = đếm timesheet có absence_type = null
            // Ngày nghỉ = đếm số lượng các trường có giá trị >= 1 trong: travel_days, leave_days, unauthorized_leave, visa_extension, permission_granted, training_days
            var leaveDays = CountLeaveDays(e);
            
            return new EmployeeViewModel
            {
                EmployeeId = e.EmployeeId,
                Fullname = e.Fullname,
                FullnameOther = e.FullnameOther,
                Type = e.Type,
                Active = e.Active,
                SkillLv = e.SkillLv,
                SkillNote = e.SkillNote,
                TimeTest = e.TimeTest,
                ProjectCodes = projectMonths.Where(pm => pm.EmployeeId == e.EmployeeId && pm.Project != null).Select(pm => pm.Project.ProjectCode!).ToList(),
                Sale = e.Sale,
                WorkDays = workDays,
                TravelDays = e.TravelDays,
                LeaveDays = leaveDays,
                UnauthorizedLeave = e.UnauthorizedLeave,
                VisaExtension = e.VisaExtension,
                PermissionGranted = e.PermissionGranted,
                NightShiftDays = e.NightShiftDays,
                TrainingDays = e.TrainingDays,
                TotalDays = totalDays,
                TotalWorkTime = totalWorkTime,
                AreaId = e.AreaId,
                AreaName = e.Area?.Name,
                PlantName = e.PlantName
            };
        });
    }

    public async Task<EmployeeViewModel?> GetEmployeeByIdAsync(int id, DateOnly? month = null)
    {
        var employee = await _employeeRepository.GetWithAreaAsync(id);
        if (employee == null) return null;

        var timesheets = await _timesheetRepository.GetByEmployeeIdAsync(id);
        var timesheetList = timesheets.ToList();
        var totalWorkTime = CalculateTotalWorkTime(timesheetList);
        var totalDays = timesheetList.Count; 
        var workDays = timesheetList.Count(t => t.AbsenceType == null); 
        var leaveDays = CountLeaveDays(employee);

        var viewModel = new EmployeeViewModel
        {
            EmployeeId = employee.EmployeeId,
            Fullname = employee.Fullname,
            FullnameOther = employee.FullnameOther,
            Type = employee.Type,
            Active = employee.Active,
            SkillLv = employee.SkillLv,
            SkillNote = employee.SkillNote,
            TimeTest = employee.TimeTest,
            Sale = employee.Sale,
            WorkDays = workDays,
            TravelDays = employee.TravelDays,
            LeaveDays = leaveDays,
            UnauthorizedLeave = employee.UnauthorizedLeave,
            VisaExtension = employee.VisaExtension,
            PermissionGranted = employee.PermissionGranted,
            NightShiftDays = employee.NightShiftDays,
            TrainingDays = employee.TrainingDays,
            TotalDays = totalDays,
            TotalWorkTime = totalWorkTime,
            AreaId = employee.AreaId,
            AreaName = employee.Area?.Name,
            PlantName = employee.PlantName
        };

        if (month.HasValue)
        {
            var projectMonths = await _projectMonthRepository.GetByEmployeeAndMonthAsync(id, month.Value);
            viewModel.ProjectCodes = projectMonths
                .Select(pm => pm.Project.ProjectCode)
                .ToList();
        }
        else
        {
            viewModel.ProjectCodes = employee.EmployeeProjects?
                .Select(ep => ep.Project.ProjectCode)
                .ToList() ?? new List<string>();
        }

        return viewModel;
    }

    public async Task<EmployeeViewModel> CreateEmployeeAsync(CreateEmployeeViewModel model, DateOnly? month = null)
    {
        var employee = new EmployeeModel
        {
            Fullname = model.Fullname,
            FullnameOther = model.FullnameOther,
            Type = model.Type,
            Active = model.Active,
            SkillLv = model.SkillLv,
            SkillNote = model.SkillNote,
            TimeTest = model.TimeTest,
            Sale = model.Sale,
            AreaId = model.AreaId,
            PlantName = model.PlantName
        };

        await _employeeRepository.AddAsync(employee);

        // Add projects
        if (model.ProjectCodes != null && model.ProjectCodes.Any())
        {
            foreach (var projectCode in model.ProjectCodes)
            {
                var project = await _projectRepository.GetByProjectCodeAsync(projectCode);
                if (project != null)
                {
                    if (month.HasValue)
                    {
                        var projectMonth = new Employee.Core.Models.ProjectMonth
                        {
                            EmployeeId = employee.EmployeeId,
                            ProjectId = project.ProjectId,
                            Month = month.Value
                        };
                        await _projectMonthRepository.AddAsync(projectMonth);
                    }
                    else
                    {
                        var employeeProject = new Employee.Core.Models.EmployeeProject
                        {
                            EmployeeId = employee.EmployeeId,
                            ProjectId = project.ProjectId
                        };
                        _context.EmployeeProjects.Add(employeeProject);
                    }
                }
            }
            if (!month.HasValue) 
            {
                await _context.SaveChangesAsync();
            }
        }

        // Reload employee with projects
        var loadedEmployee = await _employeeRepository.GetByIdAsync(employee.EmployeeId) ?? employee;

        return await GetEmployeeByIdAsync(employee.EmployeeId, month) ?? new EmployeeViewModel
        {
            EmployeeId = loadedEmployee.EmployeeId,
            Fullname = loadedEmployee.Fullname,
            FullnameOther = loadedEmployee.FullnameOther,
            Type = loadedEmployee.Type,
            Active = loadedEmployee.Active,
            SkillLv = loadedEmployee.SkillLv,
            SkillNote = loadedEmployee.SkillNote,
            TimeTest = loadedEmployee.TimeTest,
            ProjectCodes = model.ProjectCodes?.ToList() ?? new List<string>(),
            Sale = loadedEmployee.Sale,
            AreaId = loadedEmployee.AreaId,
            PlantName = loadedEmployee.PlantName
        };
    }

    public async Task<EmployeeViewModel?> UpdateEmployeeAsync(int id, UpdateEmployeeViewModel model, DateOnly? month = null)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null) return null;

        employee.Fullname = model.Fullname;
        employee.FullnameOther = model.FullnameOther;
        employee.Type = model.Type;
        employee.Active = model.Active;
        employee.SkillLv = model.SkillLv;
        employee.SkillNote = model.SkillNote;
        employee.TimeTest = model.TimeTest;
        employee.Sale = model.Sale;
        employee.AreaId = model.AreaId;
        employee.PlantName = model.PlantName;
        employee.TravelDays = model.TravelDays;
        employee.VisaExtension = model.VisaExtension;
        employee.PermissionGranted = model.PermissionGranted;
        employee.TrainingDays = model.TrainingDays;
        employee.UpdatedAt = DateTime.Now;

        await _employeeRepository.UpdateAsync(employee);

        // Update projects
        if (month.HasValue && model.ProjectCodes != null)
        {
            // Update ProjectMonth
            var existingProjectMonths = await _projectMonthRepository.GetByEmployeeAndMonthAsync(id, month.Value);
            foreach (var pm in existingProjectMonths)
            {
                await _projectMonthRepository.DeleteAsync(pm);
            }

            foreach (var code in model.ProjectCodes)
            {
                var project = await _projectRepository.GetByProjectCodeAsync(code);
                if (project != null)
                {
                    await _projectMonthRepository.AddAsync(new Employee.Core.Models.ProjectMonth
                    {
                        EmployeeId = id,
                        ProjectId = project.ProjectId,
                        Month = month.Value
                    });
                }
            }
        }
        else if (model.ProjectCodes != null)
        {
            // Update static EmployeeProjects
            var existingEmployeeProjects = _context.EmployeeProjects
                .Where(ep => ep.EmployeeId == id)
                .ToList();
            _context.EmployeeProjects.RemoveRange(existingEmployeeProjects);

            foreach (var projectCode in model.ProjectCodes)
            {
                var project = await _projectRepository.GetByProjectCodeAsync(projectCode);
                if (project != null)
                {
                    var employeeProject = new Employee.Core.Models.EmployeeProject
                    {
                        EmployeeId = id,
                        ProjectId = project.ProjectId
                    };
                    _context.EmployeeProjects.Add(employeeProject);
                }
            }
            await _context.SaveChangesAsync();
        }

        return await GetEmployeeByIdAsync(id, month);
    }

    public async Task<IEnumerable<ProjectViewModel>> GetEmployeeProjectsByMonthAsync(int employeeId, DateOnly month)
    {
        var projectMonths = await _projectMonthRepository.GetByEmployeeAndMonthAsync(employeeId, month);
        return projectMonths.Select(pm => new ProjectViewModel
        {
            ProjectId = pm.ProjectId,
            ProjectName = pm.Project.ProjectName,
            ProjectCode = pm.Project.ProjectCode
        });
    }

    public async Task AddProjectToEmployeeMonthAsync(int employeeId, int projectId, DateOnly month)
    {
        var existing = await _projectMonthRepository.GetAsync(projectId, employeeId, month);
        if (existing == null)
        {
            await _projectMonthRepository.AddAsync(new Employee.Core.Models.ProjectMonth
            {
                EmployeeId = employeeId,
                ProjectId = projectId,
                Month = month
            });
        }
    }

    public async Task RemoveProjectFromEmployeeMonthAsync(int employeeId, int projectId, DateOnly month)
    {
        var existing = await _projectMonthRepository.GetAsync(projectId, employeeId, month);
        if (existing != null)
        {
            await _projectMonthRepository.DeleteAsync(existing);
        }
    }

    public async Task<bool> DeleteEmployeeAsync(int id)
    {
        var employee = await _employeeRepository.GetByIdAsync(id);
        if (employee == null) return false;

        await _employeeRepository.DeleteAsync(employee);
        return true;
    }

    public async Task<bool> RecalculateEmployeeStatsAsync(int employeeId)
    {
        var employee = await _employeeRepository.GetByIdAsync(employeeId);
        if (employee == null) return false;

        // Tính toán các trường từ Timesheet
        // TotalDays = số lần employee_id xuất hiện trong timesheet
        employee.TotalDays = await _timesheetRepository.CountAllByEmployeeIdAsync(employeeId);
        // WorkDays = đếm timesheet có absence_type = null
        employee.WorkDays = await _timesheetRepository.CountByEmployeeAndAbsenceTypeNullAsync(employeeId);
        // LeaveDays = tổng absence_type = 0 và 1
        employee.LeaveDays = await _timesheetRepository.CountLeaveDaysByEmployeeAsync(employeeId);
        employee.UnauthorizedLeave = await _timesheetRepository.CountByEmployeeAndAbsenceTypeAsync(employeeId, 1);
        employee.NightShiftDays = await _timesheetRepository.CountByEmployeeAndWorkTimeAsync(employeeId);

        await _employeeRepository.UpdateAsync(employee);
        return true;
    }

    // Calculate total work time in hours from timesheets
    private static decimal? CalculateTotalWorkTime(List<Employee.Core.Models.Timesheet> timesheets)
    {
        if (timesheets == null || timesheets.Count == 0)
            return null;

        decimal totalHours = 0;
        foreach (var timesheet in timesheets)
        {
            if (timesheet.WorkStart.HasValue && timesheet.WorkEnd.HasValue)
            {
                var start = timesheet.WorkStart.Value;
                var end = timesheet.WorkEnd.Value;

                // Handle case where end time is next day (e.g., night shift)
                TimeSpan duration;
                if (end < start)
                {
                    // Assuming work ends on the next day
                    duration = (TimeSpan.FromHours(24) - start.ToTimeSpan()) + end.ToTimeSpan();
                }
                else
                {
                    duration = end.ToTimeSpan() - start.ToTimeSpan();
                }

                totalHours += (decimal)duration.TotalHours;
            }
        }

        return totalHours > 0 ? Math.Round(totalHours, 2) : null;
    }

    // Đếm số lượng các trường có giá trị >= 1 trong: travel_days, leave_days, unauthorized_leave, visa_extension, permission_granted, training_days
    private static int CountLeaveDays(EmployeeModel employee)
    {
        int count = 0;
        if (employee.TravelDays >= 1) count++;
        if (employee.LeaveDays >= 1) count++;
        if (employee.UnauthorizedLeave >= 1) count++;
        if (employee.VisaExtension >= 1) count++;
        if (employee.PermissionGranted >= 1) count++;
        if (employee.TrainingDays >= 1) count++;
        return count;
    }
}

