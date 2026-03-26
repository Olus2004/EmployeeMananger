namespace Employee.Core.Models;

public class EmployeeProject
{
    public int EmployeeProjectId { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public Employee Employee { get; set; } = null!;
    public Project Project { get; set; } = null!;
}

