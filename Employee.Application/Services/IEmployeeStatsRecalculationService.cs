namespace Employee.Application.Services;

public interface IEmployeeStatsRecalculationService
{
    Task RecalculateAllEmployeesStatsAsync();
}

