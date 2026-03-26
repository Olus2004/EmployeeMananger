using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;

namespace Employee.Application.Services;

public class AreaService : IAreaService
{
    private readonly IAreaRepository _areaRepository;

    public AreaService(IAreaRepository areaRepository)
    {
        _areaRepository = areaRepository;
    }

    public async Task<IEnumerable<AreaViewModel>> GetAllAreasAsync()
    {
        var areas = await _areaRepository.GetAllAsync();
        return areas.Select(a => new AreaViewModel
        {
            AreaId = a.AreaId,
            Name = a.Name,
            Description = a.Description,
            Active = a.Active
        });
    }

    public async Task<IEnumerable<AreaViewModel>> GetActiveAreasAsync()
    {
        var areas = await _areaRepository.GetActiveAreasAsync();
        return areas.Select(a => new AreaViewModel
        {
            AreaId = a.AreaId,
            Name = a.Name,
            Description = a.Description,
            Active = a.Active
        });
    }

    public async Task<AreaViewModel?> GetAreaByIdAsync(int id)
    {
        var area = await _areaRepository.GetByIdAsync(id);
        if (area == null) return null;

        return new AreaViewModel
        {
            AreaId = area.AreaId,
            Name = area.Name,
            Description = area.Description,
            Active = area.Active
        };
    }

    public async Task<AreaViewModel> CreateAreaAsync(CreateAreaViewModel model)
    {
        var area = new Area
        {
            Name = model.Name,
            Description = model.Description,
            Active = model.Active
        };

        await _areaRepository.AddAsync(area);

        return new AreaViewModel
        {
            AreaId = area.AreaId,
            Name = area.Name,
            Description = area.Description,
            Active = area.Active
        };
    }

    public async Task<AreaViewModel?> UpdateAreaAsync(int id, UpdateAreaViewModel model)
    {
        var area = await _areaRepository.GetByIdAsync(id);
        if (area == null) return null;

        area.Name = model.Name;
        area.Description = model.Description;
        area.Active = model.Active;

        await _areaRepository.UpdateAsync(area);

        return new AreaViewModel
        {
            AreaId = area.AreaId,
            Name = area.Name,
            Description = area.Description,
            Active = area.Active
        };
    }

    public async Task<bool> DeleteAreaAsync(int id)
    {
        var area = await _areaRepository.GetByIdAsync(id);
        if (area == null) return false;

        await _areaRepository.DeleteAsync(area);
        return true;
    }
}

