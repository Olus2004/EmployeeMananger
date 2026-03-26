namespace Employee.Core.Models;

public class Backup
{
    public int BackupId { get; set; }
    public string BackupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExcelFileName { get; set; } = string.Empty;
    public string DataJson { get; set; } = string.Empty; // JSON chứa snapshot của employee, timesheet, area, feedback
    public DateTime CreatedAt { get; set; }
    public DateTime? RestoredAt { get; set; }
}

