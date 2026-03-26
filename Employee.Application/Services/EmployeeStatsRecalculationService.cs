using Employee.Core.Interfaces;
using EmployeeModel = Employee.Core.Models.Employee;
using Employee.Core.Models;

namespace Employee.Application.Services;

public class EmployeeStatsRecalculationService : IEmployeeStatsRecalculationService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITimesheetRepository _timesheetRepository;

    public EmployeeStatsRecalculationService(
        IEmployeeRepository employeeRepository,
        ITimesheetRepository timesheetRepository)
    {
        _employeeRepository = employeeRepository;
        _timesheetRepository = timesheetRepository;
    }

    public async Task RecalculateAllEmployeesStatsAsync()
    {
        var employees = (await _employeeRepository.GetAllAsync()).ToList();
        var allTimesheets = (await _timesheetRepository.GetAllAsync()).ToList();

        foreach (var employee in employees)
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == employee.EmployeeId).ToList();

            // work_days: đếm số lần employee_id xuất hiện với status = 1
            employee.WorkDays = employeeTimesheets.Count(t => t.Status == 1);

            // travel_days: đếm số lần với status = 4
            employee.TravelDays = employeeTimesheets.Count(t => t.Status == 4);

            // leave_days: đếm số lần với status = 2
            employee.LeaveDays = employeeTimesheets.Count(t => t.Status == 2);

            // unauthorized_leave: đếm số lần với status = 3
            employee.UnauthorizedLeave = employeeTimesheets.Count(t => t.Status == 3);

            // visa_extension: đếm số lần với status = 5
            employee.VisaExtension = employeeTimesheets.Count(t => t.Status == 5);

            // permission_granted: đếm số lần với status = 7
            employee.PermissionGranted = employeeTimesheets.Count(t => t.Status == 7);

            // training_days: đếm số lần với status = 6
            employee.TrainingDays = employeeTimesheets.Count(t => t.Status == 6);

            // night_shift_days: giữ nguyên (không tính lại)
            // employee.NightShiftDays giữ nguyên giá trị hiện tại

            // total_days = tổng số lần employee_id xuất hiện trong timesheet
            employee.TotalDays = employeeTimesheets.Count;

            await _employeeRepository.UpdateAsync(employee);
        }
    }
}

