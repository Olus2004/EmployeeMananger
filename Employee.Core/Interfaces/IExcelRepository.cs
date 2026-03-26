using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IExcelRepository : IRepository<Excel>
{
    Task<IEnumerable<Excel>> GetRecentUploadsAsync(int count = 10);
}

