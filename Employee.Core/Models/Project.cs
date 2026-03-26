namespace Employee.Core.Models;

public class Project
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string? ProjectDescription { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = new List<EmployeeProject>();
    public ICollection<ProjectMonth> ProjectMonths { get; set; } = new List<ProjectMonth>();
}

