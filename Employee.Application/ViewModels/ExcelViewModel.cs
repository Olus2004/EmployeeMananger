namespace Employee.Application.ViewModels;

public class ExcelViewModel
{
    public int ExcelId { get; set; }
    public string ExcelName { get; set; } = string.Empty;
    public DateTime TimeUpload { get; set; }
}

public class CreateExcelViewModel
{
    public string ExcelName { get; set; } = string.Empty;
}

public class ImportResultViewModel
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int EmployeesImported { get; set; }
    public int TimesheetsImported { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<DebugSqlStatement> DebugSqlStatements { get; set; } = new();
}

public class DebugSqlStatement
{
    public string Type { get; set; } = string.Empty; // Employee, Timesheet, Area
    public string Sql { get; set; } = string.Empty;
    public int RowNumber { get; set; }
    public string SheetName { get; set; } = string.Empty;
}

public class ExportResultViewModel
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public byte[]? FileContent { get; set; }
    public string FileName { get; set; } = string.Empty;
}

public class BackupViewModel
{
    public int BackupId { get; set; }
    public string BackupName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExcelFileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? RestoredAt { get; set; }
    public int EmployeeCount { get; set; }
    public int TimesheetCount { get; set; }
    public int AreaCount { get; set; }
    public int FeedbackCount { get; set; }
}

public class BackupResultViewModel
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int BackupId { get; set; }
}

public class RestoreResultViewModel
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

