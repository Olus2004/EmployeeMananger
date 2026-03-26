using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IBackupRepository : IRepository<Backup>
{
    Task<IEnumerable<Backup>> GetAllOrderedByDateDescAsync();
}

