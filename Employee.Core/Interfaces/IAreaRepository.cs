using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IAreaRepository : IRepository<Area>
{
    Task<IEnumerable<Area>> GetActiveAreasAsync();
}

