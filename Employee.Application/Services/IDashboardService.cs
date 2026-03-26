using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IDashboardService
{
    Task<DashboardViewModel> GetDashboardDataAsync(DateOnly? date = null);
}

