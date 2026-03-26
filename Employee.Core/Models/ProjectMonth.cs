namespace Employee.Core.Models;

public class ProjectMonth
{
    public int ProjectMonthId { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public DateOnly Month { get; set; } // Stored as first day of month (e.g. 2026-03-01)
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Project Project { get; set; } = null!;
}
