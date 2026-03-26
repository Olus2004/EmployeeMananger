namespace Employee.Core.Models;

public class Area
{
    public int AreaId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Active { get; set; } = 1; // 1: hoạt động, 2: ko hoạt động
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
}

