namespace Employee.Core.Models;

public class Timesheet
{
    public int TimesheetId { get; set; }
    public int EmployeeId { get; set; }
    public DateOnly Day { get; set; }
    public byte? DayOfWeek { get; set; } // 1-7
    public TimeOnly? WorkStart { get; set; } // Giờ bắt đầu làm việc
    public TimeOnly? WorkEnd { get; set; } // Giờ kết thúc làm việc
    public decimal? WorkTime { get; set; } // giờ làm việc
    public short Status { get; set; } = 1; // 1: làm, 2: nghỉ, 3: xin nghỉ, 4: di chuyển, 5: làm visa, 6: đào tạo, 7: mở quyền hạn

    public short? AbsenceType { get; set; } // 0: Không đi làm do lý do cá nhân, 1: Không phải lý do cá nhân, NULL: Đi làm bình thường
    public string? AbsenceReason { get; set; }
    public string? Notes { get; set; }

    public int? AreaId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Area? Area { get; set; }
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}

