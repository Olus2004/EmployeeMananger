namespace Employee.Application.ViewModels;

public class FeedbackViewModel
{
    public int FeedbackId { get; set; }
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public int TimesheetId { get; set; }
    public DateOnly? TimesheetDay { get; set; }
    public string? Description { get; set; }
    public DateTime SubmittedAt { get; set; }
    public string? AdminResponse { get; set; }
    public DateTime? RespondedAt { get; set; }
    // Trạng thái hiển thị ở màn Quản lý phản hồi: từ StatusResponse (1: Đang xử lí, 2: Đã đóng, 3: Đã hoàn thành)
    public short Status { get; set; }
    // Trạng thái cho employee-timesheet: từ Status (1: Đúng, 2: Sai, 3: Đang xử lí)
    public short EmployeeStatus { get; set; }
}

public class CreateFeedbackViewModel
{
    public int EmployeeId { get; set; }
    public int TimesheetId { get; set; }
    public string? Description { get; set; }
    public short? Status { get; set; } // Optional: 1: đang xử lí, 2: đã đóng, 3: đã hoàn thành
}

public class UpdateFeedbackViewModel
{
    public string? AdminResponse { get; set; }
    public short? Status { get; set; } // 1: đang xử lí, 2: đã đóng, 3: đã hoàn thành
}

public class RespondFeedbackViewModel
{
    public string AdminResponse { get; set; } = string.Empty;
    public short Status { get; set; } = 3; // 3: đã hoàn thành
}

