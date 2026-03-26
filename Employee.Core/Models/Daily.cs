using System;

namespace Employee.Core.Models;

public class Daily
{
    public int DailyId { get; set; }
    public int EmployeeId { get; set; }
    public DateOnly Day { get; set; }
    
    // Snapshot fields requested by user
    public string? Fullname { get; set; }
    public string? AreaName { get; set; }
    
    public short Status { get; set; } = 1; // 1: làm, 2: nghỉ, 3: xin nghỉ, 4: di chuyển, 5: làm visa, 6: đào tạo, 7: mở quyền hạn
    
    public TimeOnly? WorkStart { get; set; }
    public TimeOnly? WorkEnd { get; set; }
    
    public short SkillLv { get; set; } = 0;
    public string? SkillNote { get; set; }
    public DateTime? TimeTest { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Employee Employee { get; set; } = null!;
}
