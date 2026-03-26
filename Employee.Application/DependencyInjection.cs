using Microsoft.Extensions.DependencyInjection;
using Employee.Application.Services;

namespace Employee.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register Services
        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<ITimesheetService, TimesheetService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<IExcelService, ExcelService>();
        services.AddScoped<IBackupService, BackupService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IEmployeeStatsRecalculationService, EmployeeStatsRecalculationService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IDailyService, DailyService>();

        return services;
    }
}

