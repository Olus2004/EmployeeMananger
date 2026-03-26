using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IFeedbackService
{
    Task<IEnumerable<FeedbackViewModel>> GetAllFeedbacksAsync();
    Task<FeedbackViewModel?> GetFeedbackByIdAsync(int id);
    Task<IEnumerable<FeedbackViewModel>> GetFeedbacksByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<FeedbackViewModel>> GetFeedbacksByTimesheetIdAsync(int timesheetId);
    Task<IEnumerable<FeedbackViewModel>> GetPendingFeedbacksAsync();
    Task<IEnumerable<FeedbackViewModel>> GetRespondedFeedbacksAsync();
    Task<FeedbackViewModel> CreateFeedbackAsync(CreateFeedbackViewModel model);
    Task<FeedbackViewModel?> UpdateFeedbackAsync(int id, UpdateFeedbackViewModel model);
    Task<FeedbackViewModel?> RespondFeedbackAsync(int id, RespondFeedbackViewModel model);
    Task<FeedbackViewModel?> UpdateStatusAsync(int id, short status);
    Task<bool> DeleteFeedbackAsync(int id);
}

