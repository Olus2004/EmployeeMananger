using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Employee.Core.Interfaces;
using Employee.Infrastructure.Data;
using Employee.Infrastructure.Repositories;

namespace Employee.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<EmployeeDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

        // Register Repositories
        services.AddScoped<IAreaRepository, AreaRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ITimesheetRepository, TimesheetRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IExcelRepository, ExcelRepository>();
        services.AddScoped<IBackupRepository, BackupRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IProjectMonthRepository, ProjectMonthRepository>();
        services.AddScoped<IDailyRepository, DailyRepository>();

        // Register External AI Services
        services.AddHttpClient<Employee.Core.Interfaces.IOpenClawService, Employee.Infrastructure.Services.OpenClawService>();

        return services;
    }
}

