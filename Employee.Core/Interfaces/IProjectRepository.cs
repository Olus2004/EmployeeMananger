using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IProjectRepository : IRepository<Project>
{
    Task<Project?> GetByProjectCodeAsync(string projectCode);
    Task<IEnumerable<Project>> GetAllProjectsAsync();
}

