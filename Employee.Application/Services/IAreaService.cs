using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IAreaService
{
    Task<IEnumerable<AreaViewModel>> GetAllAreasAsync();
    Task<IEnumerable<AreaViewModel>> GetActiveAreasAsync();
    Task<AreaViewModel?> GetAreaByIdAsync(int id);
    Task<AreaViewModel> CreateAreaAsync(CreateAreaViewModel model);
    Task<AreaViewModel?> UpdateAreaAsync(int id, UpdateAreaViewModel model);
    Task<bool> DeleteAreaAsync(int id);
}

