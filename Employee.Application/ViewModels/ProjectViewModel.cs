namespace Employee.Application.ViewModels;

public class ProjectViewModel
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string? ProjectDescription { get; set; }
    public int EmployeeCount { get; set; } // Số lượng nhân viên thuộc project
    public int MonthlyEmployeeCount { get; set; } // Số nhân viên trong tháng (project_month)
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProjectViewModel
{
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string? ProjectDescription { get; set; }
}

public class UpdateProjectViewModel
{
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public string? ProjectDescription { get; set; }
}

