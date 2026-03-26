namespace Employee.Core.Models;

public class Excel
{
    public int ExcelId { get; set; }
    public string ExcelName { get; set; } = string.Empty;
    public DateTime TimeUpload { get; set; } = DateTime.Now;
}

