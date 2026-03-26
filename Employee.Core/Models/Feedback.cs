using System.ComponentModel.DataAnnotations.Schema;

namespace Employee.Core.Models;

public class Feedback
{
    public int FeedbackId { get; set; }
    public int EmployeeId { get; set; }
    public int TimesheetId { get; set; }

    public string? Description { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.Now;

    public string? AdminResponse { get; set; }
    public DateTime? RespondedAt { get; set; }

    // Trạng thái kỹ thuật cho luồng phản hồi cũ (2: chưa phản hồi, 3: đã phản hồi)
    [Column("status")]
    public short Status { get; set; } = 2;

    // Trạng thái nghiệp vụ hiển thị ở màn quản lý phản hồi: 1: Đang xử lí, 2: Đã đóng, 3: Đã hoàn thành
    [Column("status_response")]
    public short? StatusResponse { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Timesheet Timesheet { get; set; } = null!;
}

