using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IDailyService
{
    Task<DailyViewModel?> GetDailyByIdAsync(int id);
    Task<IEnumerable<DailyViewModel>> GetDailiesByDayAsync(DateOnly day);
    Task<DailyViewModel> CreateDailyAsync(CreateDailyViewModel model);
    Task<DailyViewModel?> UpdateDailyAsync(int id, UpdateDailyViewModel model);
    Task<bool> DeleteDailyAsync(int id);
    Task<IEnumerable<DailyViewModel>> GetInitialDailyListAsync(DateOnly day);
    Task<DailyStatsViewModel> GetMonthlyStatsAsync(DateOnly day);
    Task<bool> SyncToTimesheetAsync(int dailyId);
}
