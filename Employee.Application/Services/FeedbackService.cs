using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;

namespace Employee.Application.Services;

public class FeedbackService : IFeedbackService
{
    private readonly IFeedbackRepository _feedbackRepository;

    public FeedbackService(IFeedbackRepository feedbackRepository)
    {
        _feedbackRepository = feedbackRepository;
    }

    // Map status (employee-timesheet) -> statusResponse (admin view)
    // status: 1 = Đúng, 2 = Sai, 3 = Đang xử lí
    // statusResponse: 1 = Đang xử lí, 2 = Đã đóng, 3 = Đã hoàn thành
    private short MapStatusToStatusResponse(short status)
    {
        return status switch
        {
            1 => 3, // Đúng => Đã hoàn thành
            2 => 2, // Sai => Đã đóng
            3 => 1, // Đang xử lí => Đang xử lí
            _ => 1
        };
    }

    public async Task<IEnumerable<FeedbackViewModel>> GetAllFeedbacksAsync()
    {
        var feedbacks = await _feedbackRepository.GetAllAsync();
        return feedbacks.Select(f => new FeedbackViewModel
        {
            FeedbackId = f.FeedbackId,
            EmployeeId = f.EmployeeId,
            EmployeeName = f.Employee.Fullname,
            TimesheetId = f.TimesheetId,
            TimesheetDay = f.Timesheet.Day,
            Description = f.Description,
            SubmittedAt = f.SubmittedAt,
            AdminResponse = f.AdminResponse,
            RespondedAt = f.RespondedAt,
            Status = f.StatusResponse ?? 1,
            EmployeeStatus = f.Status
        });
    }

    public async Task<FeedbackViewModel?> GetFeedbackByIdAsync(int id)
    {
        var feedback = await _feedbackRepository.GetByIdWithNavigationAsync(id);
        if (feedback == null) return null;

        return new FeedbackViewModel
        {
            FeedbackId = feedback.FeedbackId,
            EmployeeId = feedback.EmployeeId,
            EmployeeName = feedback.Employee.Fullname,
            TimesheetId = feedback.TimesheetId,
            TimesheetDay = feedback.Timesheet.Day,
            Description = feedback.Description,
            SubmittedAt = feedback.SubmittedAt,
            AdminResponse = feedback.AdminResponse,
            RespondedAt = feedback.RespondedAt,
            Status = feedback.StatusResponse ?? 1,
            EmployeeStatus = feedback.Status
        };
    }

    public async Task<IEnumerable<FeedbackViewModel>> GetFeedbacksByEmployeeIdAsync(int employeeId)
    {
        var feedbacks = await _feedbackRepository.GetByEmployeeIdAsync(employeeId);
        return feedbacks.Select(f => new FeedbackViewModel
        {
            FeedbackId = f.FeedbackId,
            EmployeeId = f.EmployeeId,
            EmployeeName = f.Employee.Fullname,
            TimesheetId = f.TimesheetId,
            TimesheetDay = f.Timesheet.Day,
            Description = f.Description,
            SubmittedAt = f.SubmittedAt,
            AdminResponse = f.AdminResponse,
            RespondedAt = f.RespondedAt,
            Status = f.StatusResponse ?? 1,
            EmployeeStatus = f.Status
        });
    }

    public async Task<IEnumerable<FeedbackViewModel>> GetFeedbacksByTimesheetIdAsync(int timesheetId)
    {
        var feedbacks = await _feedbackRepository.GetByTimesheetIdAsync(timesheetId);
        return feedbacks.Select(f => new FeedbackViewModel
        {
            FeedbackId = f.FeedbackId,
            EmployeeId = f.EmployeeId,
            EmployeeName = f.Employee.Fullname,
            TimesheetId = f.TimesheetId,
            TimesheetDay = f.Timesheet.Day,
            Description = f.Description,
            SubmittedAt = f.SubmittedAt,
            AdminResponse = f.AdminResponse,
            RespondedAt = f.RespondedAt,
            Status = f.StatusResponse ?? 1,
            EmployeeStatus = f.Status
        });
    }

    public async Task<IEnumerable<FeedbackViewModel>> GetPendingFeedbacksAsync()
    {
        var feedbacks = await _feedbackRepository.GetPendingFeedbacksAsync();
        return feedbacks.Select(f => new FeedbackViewModel
        {
            FeedbackId = f.FeedbackId,
            EmployeeId = f.EmployeeId,
            EmployeeName = f.Employee.Fullname,
            TimesheetId = f.TimesheetId,
            TimesheetDay = f.Timesheet.Day,
            Description = f.Description,
            SubmittedAt = f.SubmittedAt,
            AdminResponse = f.AdminResponse,
            RespondedAt = f.RespondedAt,
            Status = f.StatusResponse ?? 1,
            EmployeeStatus = f.Status
        });
    }

    public async Task<IEnumerable<FeedbackViewModel>> GetRespondedFeedbacksAsync()
    {
        var feedbacks = await _feedbackRepository.GetRespondedFeedbacksAsync();
        return feedbacks.Select(f => new FeedbackViewModel
        {
            FeedbackId = f.FeedbackId,
            EmployeeId = f.EmployeeId,
            EmployeeName = f.Employee.Fullname,
            TimesheetId = f.TimesheetId,
            TimesheetDay = f.Timesheet.Day,
            Description = f.Description,
            SubmittedAt = f.SubmittedAt,
            AdminResponse = f.AdminResponse,
            RespondedAt = f.RespondedAt,
            Status = f.StatusResponse ?? 1,
            EmployeeStatus = f.Status
        });
    }

    public async Task<FeedbackViewModel> CreateFeedbackAsync(CreateFeedbackViewModel model)
    {
        var feedback = new Feedback
        {
            EmployeeId = model.EmployeeId,
            TimesheetId = model.TimesheetId,
            Description = model.Description,
            // Status: 1 = Đúng, 2 = Sai, 3 = Đang xử lí (employee-timesheet)
            Status = model.Status ?? 3,
            // StatusResponse: 1 = Đang xử lí, 2 = Đã đóng, 3 = Đã hoàn thành (màn quản lý phản hồi)
            StatusResponse = MapStatusToStatusResponse(model.Status ?? 3)
        };

        await _feedbackRepository.AddAsync(feedback);

        // Get feedback with navigation properties
        var createdFeedback = await _feedbackRepository.GetByIdWithNavigationAsync(feedback.FeedbackId);
        if (createdFeedback == null)
        {
            return new FeedbackViewModel
            {
                FeedbackId = feedback.FeedbackId,
                EmployeeId = feedback.EmployeeId,
                TimesheetId = feedback.TimesheetId,
                Description = feedback.Description,
                SubmittedAt = feedback.SubmittedAt,
                Status = feedback.StatusResponse ?? 1,
                EmployeeStatus = feedback.Status
            };
        }

        return new FeedbackViewModel
        {
            FeedbackId = createdFeedback.FeedbackId,
            EmployeeId = createdFeedback.EmployeeId,
            EmployeeName = createdFeedback.Employee.Fullname,
            TimesheetId = createdFeedback.TimesheetId,
            TimesheetDay = createdFeedback.Timesheet.Day,
            Description = createdFeedback.Description,
            SubmittedAt = createdFeedback.SubmittedAt,
            Status = createdFeedback.StatusResponse ?? 1,
            EmployeeStatus = createdFeedback.Status
        };
    }

    public async Task<FeedbackViewModel?> UpdateFeedbackAsync(int id, UpdateFeedbackViewModel model)
    {
        var feedback = await _feedbackRepository.GetByIdAsync(id);
        if (feedback == null) return null;

        if (!string.IsNullOrEmpty(model.AdminResponse))
        {
            feedback.AdminResponse = model.AdminResponse;
            feedback.RespondedAt = DateTime.Now;
        }

        if (model.Status.HasValue)
        {
            // Status ở màn phản hồi: 1 Đúng, 2 Sai, 3 Đã sửa
            feedback.Status = model.Status.Value;
            // Sau khi cập nhật trạng thái, luôn đánh dấu đã hoàn thành
            feedback.StatusResponse = 3;
        }

        await _feedbackRepository.UpdateAsync(feedback);

        // Get updated feedback with navigation properties
        var updatedFeedback = await _feedbackRepository.GetByIdWithNavigationAsync(id);
        if (updatedFeedback == null) return null;

        return new FeedbackViewModel
        {
            FeedbackId = updatedFeedback.FeedbackId,
            EmployeeId = updatedFeedback.EmployeeId,
            EmployeeName = updatedFeedback.Employee.Fullname,
            TimesheetId = updatedFeedback.TimesheetId,
            TimesheetDay = updatedFeedback.Timesheet.Day,
            Description = updatedFeedback.Description,
            SubmittedAt = updatedFeedback.SubmittedAt,
            AdminResponse = updatedFeedback.AdminResponse,
            RespondedAt = updatedFeedback.RespondedAt,
            Status = updatedFeedback.StatusResponse ?? 1,
            EmployeeStatus = updatedFeedback.Status
        };
    }

    public async Task<FeedbackViewModel?> RespondFeedbackAsync(int id, RespondFeedbackViewModel model)
    {
        var feedback = await _feedbackRepository.GetByIdAsync(id);
        if (feedback == null) return null;

        feedback.AdminResponse = model.AdminResponse;
        feedback.RespondedAt = DateTime.Now;

        // Lưu lại trạng thái cũ của nhân viên
        var previousEmployeeStatus = feedback.Status; // 1=Đúng,2=Sai,3=Đang xử lí

        // Sau khi admin hoàn thành:
        // - status_response luôn = 3 (Đã hoàn thành ở màn quản lý phản hồi)
        // - nếu trước đó nhân viên đang để 3 (Đang xử lí do chọn Sai) thì chuyển sang 2 (Sai) để hiển thị ở employee-timesheet
        // - nếu trước đó là 1 (Đúng) thì giữ nguyên 1
        feedback.StatusResponse = 3;
        if (previousEmployeeStatus == 3)
        {
            feedback.Status = 2; // Sai
        }

        await _feedbackRepository.UpdateAsync(feedback);

        // Get updated feedback with navigation properties
        var updatedFeedback = await _feedbackRepository.GetByIdWithNavigationAsync(id);
        if (updatedFeedback == null) return null;

        return new FeedbackViewModel
        {
            FeedbackId = updatedFeedback.FeedbackId,
            EmployeeId = updatedFeedback.EmployeeId,
            EmployeeName = updatedFeedback.Employee.Fullname,
            TimesheetId = updatedFeedback.TimesheetId,
            TimesheetDay = updatedFeedback.Timesheet.Day,
            Description = updatedFeedback.Description,
            SubmittedAt = updatedFeedback.SubmittedAt,
            AdminResponse = updatedFeedback.AdminResponse,
            RespondedAt = updatedFeedback.RespondedAt,
            Status = updatedFeedback.StatusResponse ?? 1,
            EmployeeStatus = updatedFeedback.Status
        };
    }

    public async Task<FeedbackViewModel?> UpdateStatusAsync(int id, short status)
    {
        var feedback = await _feedbackRepository.GetByIdAsync(id);
        if (feedback == null) return null;

        feedback.StatusResponse = status;
        await _feedbackRepository.UpdateAsync(feedback);

        // Get updated feedback with navigation properties
        var updatedFeedback = await _feedbackRepository.GetByIdWithNavigationAsync(id);
        if (updatedFeedback == null) return null;

        return new FeedbackViewModel
        {
            FeedbackId = updatedFeedback.FeedbackId,
            EmployeeId = updatedFeedback.EmployeeId,
            EmployeeName = updatedFeedback.Employee.Fullname,
            TimesheetId = updatedFeedback.TimesheetId,
            TimesheetDay = updatedFeedback.Timesheet.Day,
            Description = updatedFeedback.Description,
            SubmittedAt = updatedFeedback.SubmittedAt,
            AdminResponse = updatedFeedback.AdminResponse,
            RespondedAt = updatedFeedback.RespondedAt,
            Status = updatedFeedback.StatusResponse ?? 1,
            EmployeeStatus = updatedFeedback.Status
        };
    }

    public async Task<bool> DeleteFeedbackAsync(int id)
    {
        var feedback = await _feedbackRepository.GetByIdAsync(id);
        if (feedback == null) return false;

        await _feedbackRepository.DeleteAsync(feedback);
        return true;
    }
}

