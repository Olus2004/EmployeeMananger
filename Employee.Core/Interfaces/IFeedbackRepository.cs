using Employee.Core.Models;

namespace Employee.Core.Interfaces;

public interface IFeedbackRepository : IRepository<Feedback>
{
    Task<Feedback?> GetByIdWithNavigationAsync(int id);
    Task<IEnumerable<Feedback>> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<Feedback>> GetByTimesheetIdAsync(int timesheetId);
    Task<IEnumerable<Feedback>> GetPendingFeedbacksAsync();
    Task<IEnumerable<Feedback>> GetRespondedFeedbacksAsync();
}

