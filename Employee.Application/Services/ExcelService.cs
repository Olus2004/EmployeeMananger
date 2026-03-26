using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using EmployeeModel = Employee.Core.Models.Employee;
using Employee.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

namespace Employee.Application.Services;

public class ExcelService : IExcelService
{
    private readonly IExcelRepository _excelRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IAreaRepository _areaRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IBackupService _backupService;
    private readonly EmployeeDbContext _context;

    public ExcelService(
        IExcelRepository excelRepository,
        IEmployeeRepository employeeRepository,
        ITimesheetRepository timesheetRepository,
        IAreaRepository areaRepository,
        IProjectRepository projectRepository,
        IBackupService backupService,
        EmployeeDbContext context)
    {
        _excelRepository = excelRepository;
        _employeeRepository = employeeRepository;
        _timesheetRepository = timesheetRepository;
        _areaRepository = areaRepository;
        _projectRepository = projectRepository;
        _backupService = backupService;
        _context = context;
    }

    public async Task<IEnumerable<ExcelViewModel>> GetAllExcelsAsync()
    {
        var excels = await _excelRepository.GetAllAsync();
        return excels.Select(e => new ExcelViewModel
        {
            ExcelId = e.ExcelId,
            ExcelName = e.ExcelName,
            TimeUpload = e.TimeUpload
        });
    }

    public async Task<IEnumerable<ExcelViewModel>> GetRecentUploadsAsync(int count = 10)
    {
        var excels = await _excelRepository.GetRecentUploadsAsync(count);
        return excels.Select(e => new ExcelViewModel
        {
            ExcelId = e.ExcelId,
            ExcelName = e.ExcelName,
            TimeUpload = e.TimeUpload
        });
    }

    public async Task<ExcelViewModel?> GetExcelByIdAsync(int id)
    {
        var excel = await _excelRepository.GetByIdAsync(id);
        if (excel == null) return null;

        return new ExcelViewModel
        {
            ExcelId = excel.ExcelId,
            ExcelName = excel.ExcelName,
            TimeUpload = excel.TimeUpload
        };
    }

    public async Task<ExcelViewModel> CreateExcelAsync(CreateExcelViewModel model)
    {
        var excel = new Excel
        {
            ExcelName = model.ExcelName
        };

        await _excelRepository.AddAsync(excel);

        return new ExcelViewModel
        {
            ExcelId = excel.ExcelId,
            ExcelName = excel.ExcelName,
            TimeUpload = excel.TimeUpload
        };
    }

    public async Task<bool> DeleteExcelAsync(int id)
    {
        var excel = await _excelRepository.GetByIdAsync(id);
        if (excel == null) return false;

        await _excelRepository.DeleteAsync(excel);
        return true;
    }

    public async Task<ImportResultViewModel> ImportExcelAsync(Stream fileStream, string fileName, bool importEmployees = true, bool importTimesheets = true)
    {
        var result = new ImportResultViewModel
        {
            Success = false,
            EmployeesImported = 0,
            TimesheetsImported = 0,
            Errors = new List<string>()
        };

        try
        {
            // Validate at least one option is selected
            if (!importEmployees && !importTimesheets)
            {
                result.Success = false;
                result.Message = "Vui lòng chọn ít nhất một loại dữ liệu để import";
                result.Errors.Add("Chưa chọn loại dữ liệu nào để import");
                return result;
            }

            // Create backup before import
            var backupResult = await _backupService.CreateBackupAsync(fileName, $"Backup tự động trước khi import: {fileName}");
            if (!backupResult.Success)
            {
                result.Errors.Add($"Cảnh báo: Không thể tạo backup: {backupResult.Message}");
            }

            using var package = new ExcelPackage(fileStream);
            var workbook = package.Workbook;

            // Import Sheet1 - Employee data
            if (importEmployees && workbook.Worksheets.Count > 0)
            {
                var sheet1 = workbook.Worksheets[0];
                await ImportEmployeesFromSheet(sheet1, result);
            }

            // Import Sheet2 and Sheet3 - Timesheet data
            if (importTimesheets)
            {
                if (workbook.Worksheets.Count > 1)
                {
                    var sheet2 = workbook.Worksheets[1];
                    await ImportTimesheetsFromSheet(sheet2, result);
                }

                if (workbook.Worksheets.Count > 2)
                {
                    var sheet3 = workbook.Worksheets[2];
                    await ImportTimesheetsFromSheet(sheet3, result);
                }
            }

            // Save Excel record
            var excel = new Excel
            {
                ExcelName = fileName
            };
            await _excelRepository.AddAsync(excel);

            result.Success = true;
            result.Message = $"Import thành công: {result.EmployeesImported} nhân viên, {result.TimesheetsImported} bảng công";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Lỗi khi import Excel: {ex.Message}";
            result.Errors.Add(ex.Message);
        }

        return result;
    }

    private async Task ImportEmployeesFromSheet(OfficeOpenXml.ExcelWorksheet sheet, ImportResultViewModel result)
    {
        var now = DateTime.Now;
        // Load all existing employees once for efficiency
        var allEmployees = (await _employeeRepository.GetAllAsync()).ToList();
        int row = 3; // Start from row 3 (skip rows 1 and 2)

        while (row <= sheet.Dimension?.End.Row)
        {
            try
            {
                // Column B: Fullname
                var fullname = sheet.Cells[row, 2].Text?.Trim();
                if (string.IsNullOrWhiteSpace(fullname))
                {
                    row++;
                    continue;
                }

                // Column C: FullnameOther
                var fullnameOther = sheet.Cells[row, 3].Text?.Trim();
                
                // Check if employee already exists (by fullname or fullnameOther)
                var existingEmployee = allEmployees.FirstOrDefault(e =>
                    (!string.IsNullOrWhiteSpace(e.Fullname) && !string.IsNullOrWhiteSpace(fullname) && 
                     e.Fullname.Equals(fullname, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrWhiteSpace(e.FullnameOther) && !string.IsNullOrWhiteSpace(fullnameOther) && 
                     e.FullnameOther.Equals(fullnameOther, StringComparison.OrdinalIgnoreCase)));
                
                if (existingEmployee != null)
                {
                    // Employee already exists, skip
                    row++;
                    continue;
                }

                // Column D: Type (VN/TQ or 越干/中干)
                var typeText = sheet.Cells[row, 4].Text?.Trim();
                short type = 1; // Default to VN
                if (!string.IsNullOrWhiteSpace(typeText))
                {
                    if (typeText.Equals("TQ", StringComparison.OrdinalIgnoreCase) || 
                        typeText.Equals("中干", StringComparison.OrdinalIgnoreCase))
                    {
                        type = 2;
                    }
                    else if (typeText.Equals("VN", StringComparison.OrdinalIgnoreCase) || 
                             typeText.Equals("越干", StringComparison.OrdinalIgnoreCase))
                    {
                        type = 1;
                    }
                }

                // Column E: PlantName
                var plantName = sheet.Cells[row, 5].Text?.Trim();

                // Column F: ProjectCode
                var projectCode = sheet.Cells[row, 6].Text?.Trim();

                // Column G: Sale
                var sale = sheet.Cells[row, 7].Text?.Trim();

                // Column L: VisaExtension
                var visaExtensionText = sheet.Cells[row, 12].Text?.Trim();
                int visaExtension = 0;
                if (!string.IsNullOrWhiteSpace(visaExtensionText) && int.TryParse(visaExtensionText, out var ve))
                {
                    visaExtension = ve;
                }

                // Column M: PermissionGranted
                var permissionGrantedText = sheet.Cells[row, 13].Text?.Trim();
                int permissionGranted = 0;
                if (!string.IsNullOrWhiteSpace(permissionGrantedText) && int.TryParse(permissionGrantedText, out var pg))
                {
                    permissionGranted = pg;
                }

                // Column N: TrainingDays
                var trainingDaysText = sheet.Cells[row, 14].Text?.Trim();
                int trainingDays = 0;
                if (!string.IsNullOrWhiteSpace(trainingDaysText) && int.TryParse(trainingDaysText, out var td))
                {
                    trainingDays = td;
                }

                var employee = new EmployeeModel
                {
                    Fullname = fullname,
                    FullnameOther = fullnameOther,
                    Type = type,
                    PlantName = plantName,
                    Sale = sale,
                    VisaExtension = visaExtension,
                    PermissionGranted = permissionGranted,
                    TrainingDays = trainingDays,
                    Active = 1,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                await _employeeRepository.AddAsync(employee);
                
                // Add project if projectCode is provided
                if (!string.IsNullOrWhiteSpace(projectCode))
                {
                    // Check if project exists by project_code
                    var existingProject = await _projectRepository.GetByProjectCodeAsync(projectCode);
                    Project project;
                    
                    if (existingProject == null)
                    {
                        // Create new project
                        project = new Project
                        {
                            ProjectCode = projectCode,
                            ProjectName = projectCode, // Use project_code as name if not provided
                            CreatedAt = now,
                            UpdatedAt = now
                        };
                        await _projectRepository.AddAsync(project);
                    }
                    else
                    {
                        project = existingProject;
                    }
                    
                    // Check if EmployeeProject mapping already exists
                    var existingMapping = await _context.EmployeeProjects
                        .FirstOrDefaultAsync(ep => ep.EmployeeId == employee.EmployeeId && ep.ProjectId == project.ProjectId);
                    
                    if (existingMapping == null)
                    {
                        // Create EmployeeProject mapping
                        var employeeProject = new EmployeeProject
                        {
                            EmployeeId = employee.EmployeeId,
                            ProjectId = project.ProjectId,
                            CreatedAt = now
                        };
                        await _context.EmployeeProjects.AddAsync(employeeProject);
                        await _context.SaveChangesAsync();
                    }
                }
                result.EmployeesImported++;
                // Add to cache for subsequent lookups
                allEmployees.Add(employee);
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Lỗi ở dòng {row} Sheet1: {ex.Message}");
            }

            row++;
        }
    }

    private async Task ImportTimesheetsFromSheet(OfficeOpenXml.ExcelWorksheet sheet, ImportResultViewModel result)
    {
        // Load all employees and areas once for efficiency
        var allEmployees = (await _employeeRepository.GetAllAsync()).ToList();
        var allAreas = (await _areaRepository.GetAllAsync()).ToList();

        int row = 3; // Start from row 3 (skip rows 1 and 2)

        while (row <= sheet.Dimension?.End.Row)
        {
            try
            {
                // Column A: Fullname -> EmployeeId
                var fullname = sheet.Cells[row, 1].Text?.Trim();
                if (string.IsNullOrWhiteSpace(fullname))
                {
                    row++;
                    continue;
                }

                var emp = allEmployees.FirstOrDefault(e => 
                    (e.Fullname != null && e.Fullname.Equals(fullname, StringComparison.OrdinalIgnoreCase)) ||
                    (e.FullnameOther != null && e.FullnameOther.Equals(fullname, StringComparison.OrdinalIgnoreCase)));

                if (emp == null)
                {
                    result.Errors.Add($"Không tìm thấy nhân viên '{fullname}' ở dòng {row}");
                    row++;
                    continue;
                }

                // Column B: Day of week
                var dayOfWeekText = sheet.Cells[row, 2].Text?.Trim();
                byte? dayOfWeek = null;
                if (!string.IsNullOrWhiteSpace(dayOfWeekText))
                {
                    dayOfWeek = MapDayOfWeekToNumber(dayOfWeekText);
                }

                // Column C: Date
                var dateText = sheet.Cells[row, 3].Text?.Trim();
                DateOnly day;
                if (string.IsNullOrWhiteSpace(dateText))
                {
                    row++;
                    continue;
                }

                if (DateTime.TryParse(dateText, out var dateValue))
                {
                    day = DateOnly.FromDateTime(dateValue);
                }
                else
                {
                    result.Errors.Add($"Ngày không hợp lệ ở dòng {row}: {dateText}");
                    row++;
                    continue;
                }

                // Column D: Work time (format: "8:00-19:00" -> work_start = 8:00, work_end = 19:00)
                var workTimeText = sheet.Cells[row, 4].Text?.Trim();
                TimeOnly? workStart = null;
                TimeOnly? workEnd = null;
                if (!string.IsNullOrWhiteSpace(workTimeText))
                {
                    // Parse format "8:00-19:00" or "08:00-19:00"
                    var parts = workTimeText.Split('-');
                    if (parts.Length == 2)
                    {
                        var startTimeStr = parts[0].Trim();
                        var endTimeStr = parts[1].Trim();
                        
                        if (TimeOnly.TryParse(startTimeStr, out var startTime))
                        {
                            workStart = startTime;
                        }
                        else
                        {
                            result.Errors.Add($"Giờ bắt đầu không hợp lệ ở dòng {row}: {startTimeStr}");
                        }
                        
                        if (TimeOnly.TryParse(endTimeStr, out var endTime))
                        {
                            workEnd = endTime;
                        }
                        else
                        {
                            result.Errors.Add($"Giờ kết thúc không hợp lệ ở dòng {row}: {endTimeStr}");
                        }
                    }
                    else if (!string.IsNullOrWhiteSpace(workTimeText))
                    {
                        result.Errors.Add($"Định dạng giờ làm việc không hợp lệ ở dòng {row}: {workTimeText} (cần format: HH:mm-HH:mm)");
                    }
                }

                // Column F: Status (在勤 = 1 | 休息 = 2 | 请假 = 3 | 移动 = 4 | 刷签证 = 5 | 培训 = 6 | 开权限 = 7)
                var statusText = sheet.Cells[row, 6].Text?.Trim();
                short status = 1; // Default to working
                if (!string.IsNullOrWhiteSpace(statusText))
                {
                    // Try parse number 1-7
                    if (short.TryParse(statusText, out var st) && st >= 1 && st <= 7)
                    {
                        status = st;
                    }
                    else
                    {
                        // Map common text (both Vietnamese and Chinese)
                        var normalized = statusText.ToLower();
                        if (normalized == "在勤" || normalized == "lam" || normalized == "làm" || normalized == "đi làm")
                            status = 1;
                        else if (normalized == "休息" || normalized == "nghi" || normalized == "nghỉ")
                            status = 2;
                        else if (normalized == "请假" || normalized.Contains("xin") || normalized.Contains("xin nghỉ"))
                            status = 3;
                        else if (normalized == "移动" || normalized.Contains("move") || normalized.Contains("di chuyển") || normalized.Contains("chuyen"))
                            status = 4;
                        else if (normalized == "刷签证" || normalized.Contains("visa") || normalized.Contains("làm visa"))
                            status = 5;
                        else if (normalized == "培训" || normalized.Contains("đào tạo") || normalized.Contains("dao tao") || normalized.Contains("train"))
                            status = 6;
                        else if (normalized == "开权限" || normalized.Contains("quyền") || normalized.Contains("quyen") || normalized.Contains("mở quyền"))
                            status = 7;
                    }
                }

                // Column G: Area
                var areaName = sheet.Cells[row, 7].Text?.Trim();
                int? areaId = null;
                if (!string.IsNullOrWhiteSpace(areaName))
                {
                    var existingArea = allAreas.FirstOrDefault(a => 
                        a.Name.Equals(areaName, StringComparison.OrdinalIgnoreCase));
                    
                    if (existingArea == null)
                    {
                        // Create new area
                        var newArea = new Area
                        {
                            Name = areaName,
                            Active = 1,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        };
                        
                        await _areaRepository.AddAsync(newArea);
                        areaId = newArea.AreaId;
                        // Add to cache for subsequent lookups
                        allAreas.Add(newArea);
                    }
                    else
                    {
                        areaId = existingArea.AreaId;
                    }
                    
                    // Tự động thêm area_id vào bảng employee (yêu cầu)
                    if (areaId.HasValue && emp.AreaId != areaId.Value)
                    {
                        emp.AreaId = areaId.Value;
                        emp.UpdatedAt = DateTime.Now;
                        await _employeeRepository.UpdateAsync(emp);
                    }
                }

                // Column I: AbsenceType (非个人原因 = 1 | 个人原因 = 0 | Trống = NULL)
                var absenceTypeText = sheet.Cells[row, 9].Text?.Trim();
                short? absenceType = null;
                if (!string.IsNullOrWhiteSpace(absenceTypeText))
                {
                    if (absenceTypeText.Equals("非个人原因", StringComparison.OrdinalIgnoreCase))
                    {
                        absenceType = 1;
                    }
                    else if (absenceTypeText.Equals("个人原因", StringComparison.OrdinalIgnoreCase))
                    {
                        absenceType = 0;
                    }
                }

                // Column J: AbsenceReason
                var absenceReason = sheet.Cells[row, 10].Text?.Trim();

                // Column K: Notes
                var notes = sheet.Cells[row, 11].Text?.Trim();

                // Check if timesheet already exists
                var existingTimesheet = await _timesheetRepository.GetByEmployeeAndDayAsync(emp.EmployeeId, day);
                Timesheet timesheet;

                if (existingTimesheet != null)
                {
                    // Update existing timesheet
                    timesheet = existingTimesheet;
                    timesheet.DayOfWeek = dayOfWeek;
                    timesheet.WorkStart = workStart;
                    timesheet.WorkEnd = workEnd;
                    timesheet.Status = status;
                    timesheet.AreaId = areaId;
                    timesheet.AbsenceType = absenceType;
                    timesheet.AbsenceReason = absenceReason;
                    timesheet.Notes = notes;
                    timesheet.UpdatedAt = DateTime.Now;
                    
                    await _timesheetRepository.UpdateAsync(timesheet);
                }
                else
                {
                    // Create new timesheet
                    timesheet = new Timesheet
                    {
                        EmployeeId = emp.EmployeeId,
                        Day = day,
                        DayOfWeek = dayOfWeek,
                        WorkStart = workStart,
                        WorkEnd = workEnd,
                        Status = status,
                        AreaId = areaId,
                        AbsenceType = absenceType,
                        AbsenceReason = absenceReason,
                        Notes = notes,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    
                    await _timesheetRepository.AddAsync(timesheet);
                    result.TimesheetsImported++;
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Lỗi ở dòng {row}: {ex.Message}");
            }

            row++;
        }
    }

    private byte? MapDayOfWeekToNumber(string dayText)
    {
        if (string.IsNullOrWhiteSpace(dayText))
            return null;

        // Map day names to numbers (Monday = 2, so Sunday = 1)
        var dayLower = dayText.ToLowerInvariant().Trim();
        
        return dayLower switch
        {
            "sunday" or "chủ nhật" or "cn" => 1,
            "monday" or "thứ hai" or "thứ 2" or "t2" => 2,
            "tuesday" or "thứ ba" or "thứ 3" or "t3" => 3,
            "wednesday" or "thứ tư" or "thứ 4" or "t4" => 4,
            "thursday" or "thứ năm" or "thứ 5" or "t5" => 5,
            "friday" or "thứ sáu" or "thứ 6" or "t6" => 6,
            "saturday" or "thứ bảy" or "thứ 7" or "t7" => 7,
            _ => null
        };
    }

    public async Task<ExportResultViewModel> ExportExcelAsync(int? year = null, int? month = null, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        try
        {
            // Use current year/month if not provided
            var now = DateTime.Now;
            var exportYear = year ?? now.Year;
            var exportMonth = month ?? now.Month;

            using var package = new ExcelPackage();
            
            // Load all data
            var allEmployees = (await _employeeRepository.GetAllAsync()).ToList();
            var allTimesheets = (await _timesheetRepository.GetAllAsync()).ToList();
            
            // Filter timesheets by date range if provided
            if (startDate.HasValue || endDate.HasValue)
            {
                if (startDate.HasValue && endDate.HasValue)
                {
                    allTimesheets = allTimesheets.Where(t => t.Day >= startDate.Value && t.Day <= endDate.Value).ToList();
                }
                else if (startDate.HasValue)
                {
                    allTimesheets = allTimesheets.Where(t => t.Day >= startDate.Value).ToList();
                }
                else if (endDate.HasValue)
                {
                    allTimesheets = allTimesheets.Where(t => t.Day <= endDate.Value).ToList();
                }
            }
            // If year/month provided but no date range, filter by year/month
            else if (year.HasValue || month.HasValue)
            {
                if (year.HasValue && month.HasValue)
                {
                    var start = new DateOnly(year.Value, month.Value, 1);
                    var end = start.AddMonths(1).AddDays(-1);
                    allTimesheets = allTimesheets.Where(t => t.Day >= start && t.Day <= end).ToList();
                }
                else if (year.HasValue)
                {
                    var start = new DateOnly(year.Value, 1, 1);
                    var end = new DateOnly(year.Value, 12, 31);
                    allTimesheets = allTimesheets.Where(t => t.Day >= start && t.Day <= end).ToList();
                }
            }
            
            var allAreas = (await _areaRepository.GetAllAsync()).ToList();

            // Create Sheet1 - Employee Summary
            var sheet1 = package.Workbook.Worksheets.Add("Sheet1");
            await CreateSheet1(sheet1, allEmployees, exportYear, exportMonth);

            // Create Sheet2 - Timesheet for Type 2 (中干)
            var sheet2 = package.Workbook.Worksheets.Add("Sheet2");
            await CreateSheet2(sheet2, allEmployees.Where(e => e.Type == 2).ToList(), allTimesheets, allAreas);

            // Create Sheet3 - Timesheet for Type 1 (越干)
            var sheet3 = package.Workbook.Worksheets.Add("Sheet3");
            await CreateSheet3(sheet3, allEmployees.Where(e => e.Type == 1).ToList(), allTimesheets, allAreas);

            // Generate file name
            string fileName;
            if (startDate.HasValue && endDate.HasValue)
            {
                fileName = $"{startDate.Value:yyyyMMdd}-{endDate.Value:yyyyMMdd}越南光州厂区人员出勤统计表.xlsx";
            }
            else if (startDate.HasValue)
            {
                fileName = $"{startDate.Value:yyyyMMdd}起越南光州厂区人员出勤统计表.xlsx";
            }
            else if (endDate.HasValue)
            {
                fileName = $"{endDate.Value:yyyyMMdd}止越南光州厂区人员出勤统计表.xlsx";
            }
            else
            {
                fileName = $"{exportYear}年{exportMonth}月越南光州厂区人员出勤统计表.xlsx";
            }
            var fileContent = package.GetAsByteArray();

            return new ExportResultViewModel
            {
                Success = true,
                Message = "Export thành công",
                FileContent = fileContent,
                FileName = fileName
            };
        }
        catch (Exception ex)
        {
            return new ExportResultViewModel
            {
                Success = false,
                Message = $"Lỗi khi export Excel: {ex.Message}"
            };
        }
    }

    private Task CreateSheet1(OfficeOpenXml.ExcelWorksheet sheet, List<EmployeeModel> employees, int year, int month)
    {
        // Set font for all cells
        sheet.Cells.Style.Font.Name = "宋体";
        sheet.Cells.Style.Font.Size = 10;

        // Row 1: Title (merge A1-P1)
        sheet.Cells[1, 1, 1, 16].Merge = true;
        sheet.Cells[1, 1].Value = $"{year}年{month}月越南光州厂区人员出勤统计表";
        sheet.Cells[1, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
        sheet.Cells[1, 1].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        sheet.Cells[1, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
        sheet.Cells[1, 1].Style.Font.Bold = true;
        sheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
        
        // Apply fill color to all merged cells in row 1
        for (int col = 1; col <= 12; col++)
        {
            sheet.Cells[1, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153));
        } // Blue Accent 1 Lighter 80%

        // Row 2: Headers
        sheet.Cells[2, 1].Value = "序号";
        sheet.Cells[2, 2].Value = "姓名";
        sheet.Cells[2, 3].Value = "外籍姓名";
        sheet.Cells[2, 4].Value = "类型";
        sheet.Cells[2, 5].Value = "厂区名";
        sheet.Cells[2, 6].Value = "项目代码";
        sheet.Cells[2, 7].Value = "销售";
        sheet.Cells[2, 8].Value = "出勤天数";
        sheet.Cells[2, 9].Value = "移动天数";
        sheet.Cells[2, 10].Value = "休息天数";
        sheet.Cells[2, 11].Value = "非正常休息";
        sheet.Cells[2, 12].Value = "刷新签证";
        sheet.Cells[2, 13].Value = "开权限";
        sheet.Cells[2, 14].Value = "公司安排培训";
        sheet.Cells[2, 15].Value = "合计";
        sheet.Cells[2, 16].Value = "夜班";

        // Apply header style (row 2)
        for (int col = 1; col <= 16; col++)
        {
            sheet.Cells[2, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[2, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(217, 225, 242));
        }

        // Data rows starting from row 3
        int row = 3;
        foreach (var emp in employees)
        {
            sheet.Cells[row, 1].Value = row - 2; // STT
            sheet.Cells[row, 2].Value = emp.Fullname ?? "";
            sheet.Cells[row, 3].Value = emp.FullnameOther ?? "";
            sheet.Cells[row, 4].Value = emp.Type == 1 ? "越干" : "中干";
            sheet.Cells[row, 5].Value = emp.PlantName ?? "";
            // Get project codes from EmployeeProjects
            var projectCodes = emp.EmployeeProjects?.Select(ep => ep.Project.ProjectCode).ToList() ?? new List<string>();
            sheet.Cells[row, 6].Value = projectCodes.Any() ? string.Join(", ", projectCodes) : "";
            sheet.Cells[row, 7].Value = emp.Sale ?? "";
            sheet.Cells[row, 8].Value = emp.WorkDays;
            sheet.Cells[row, 9].Value = emp.TravelDays;
            sheet.Cells[row, 10].Value = emp.LeaveDays;
            sheet.Cells[row, 11].Value = emp.UnauthorizedLeave;
            sheet.Cells[row, 12].Value = emp.VisaExtension;
            sheet.Cells[row, 13].Value = emp.PermissionGranted;
            sheet.Cells[row, 14].Value = emp.TrainingDays;
            sheet.Cells[row, 15].Value = emp.TotalDays;
            sheet.Cells[row, 16].Value = emp.NightShiftDays;
            row++;
        }

        // Auto-fit columns
        sheet.Cells.AutoFitColumns();
        return Task.CompletedTask;
    }

    private Task CreateSheet2(OfficeOpenXml.ExcelWorksheet sheet, List<EmployeeModel> employees, List<Timesheet> allTimesheets, List<Area> areas)
    {
        // Set font for all cells
        sheet.Cells.Style.Font.Name = "宋体";
        sheet.Cells.Style.Font.Size = 10;

        // Row 1: Title (merge A1-L1)
        sheet.Cells[1, 1, 1, 12].Merge = true;
        sheet.Cells[1, 1].Value = "越南光州厂区";
        sheet.Cells[1, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
        sheet.Cells[1, 1].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        sheet.Cells[1, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
        sheet.Cells[1, 1].Style.Font.Bold = true;
        sheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
        
        // Apply fill color to all merged cells in row 1
        for (int col = 1; col <= 12; col++)
        {
            sheet.Cells[1, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153));
        }

        // Row 2: Headers
        sheet.Cells[2, 1].Value = "姓名";
        sheet.Cells[2, 2].Value = "星期";
        sheet.Cells[2, 3].Value = "日期";
        sheet.Cells[2, 4].Value = "上班时间";
        sheet.Cells[2, 5].Value = "夜班天数";
        sheet.Cells[2, 6].Value = "出勤情况";
        sheet.Cells[2, 7].Value = "出差\n区域";
        sheet.Cells[2, 8].Value = "国外实际出勤天数";
        sheet.Cells[2, 9].Value = "未出勤是个人原因\n或非个人原因";
        sheet.Cells[2, 10].Value = "未出勤原因\n详细说明";
        sheet.Cells[2, 11].Value = "备注";
        sheet.Cells[2, 12].Value = "类型";

        // Apply header style (row 1 and 2) - Orange Accent 2 Lighter 60% RGB(255, 204, 153)
        sheet.Cells[1, 1].Style.Font.Bold = true;
        for (int col = 1; col <= 12; col++)
        {
            sheet.Cells[1, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
            sheet.Cells[2, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[2, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
            sheet.Cells[2, col].Style.Font.Bold = true;
            sheet.Cells[2, col].Style.WrapText = true;
        }

        // Data rows starting from row 3
        int row = 3;
        foreach (var emp in employees)
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == emp.EmployeeId).OrderBy(t => t.Day).ToList();
            
            foreach (var timesheet in employeeTimesheets)
            {
                // Column A: Employee name
                sheet.Cells[row, 1].Value = emp.Fullname ?? emp.FullnameOther ?? "";

                // Column B: Day of week (English)
                if (timesheet.DayOfWeek.HasValue)
                {
                    sheet.Cells[row, 2].Value = GetDayOfWeekEnglish(timesheet.DayOfWeek.Value);
                }

                // Column C: Date
                sheet.Cells[row, 3].Value = timesheet.Day.ToString("yyyy-MM-dd");

                // Column D: Work time (work_start - work_end)
                if (timesheet.WorkStart.HasValue && timesheet.WorkEnd.HasValue)
                {
                    sheet.Cells[row, 4].Value = $"{timesheet.WorkStart.Value:HH:mm}-{timesheet.WorkEnd.Value:HH:mm}";
                }

                // Column E: Night shift (1 if work time overlaps with 18:00-7:00)
                int nightShift = 0;
                if (timesheet.WorkStart.HasValue && timesheet.WorkEnd.HasValue)
                {
                    var startTime = timesheet.WorkStart.Value;
                    var endTime = timesheet.WorkEnd.Value;
                    
                    // Check if work time overlaps with night shift (18:00-7:00)
                    // Night shift spans from 18:00 to next day 7:00
                    var nightStart = new TimeOnly(18, 0);
                    var nightEnd = new TimeOnly(7, 0);
                    
                    // If work spans midnight (end < start), check both parts
                    if (endTime < startTime)
                    {
                        // Work spans midnight, check if overlaps with night shift
                        if (startTime >= nightStart || endTime <= nightEnd)
                        {
                            nightShift = 1;
                        }
                    }
                    else
                    {
                        // Normal work day, check if overlaps with 18:00-24:00 or 0:00-7:00
                        if ((startTime >= nightStart && startTime <= new TimeOnly(23, 59)) ||
                            (endTime <= nightEnd && endTime >= new TimeOnly(0, 0)) ||
                            (startTime <= nightEnd && endTime >= nightStart))
                        {
                            nightShift = 1;
                        }
                    }
                }
                sheet.Cells[row, 5].Value = nightShift;

                // Column F: Status (在勤 = 1, 休息 = 2)
            sheet.Cells[row, 6].Value = timesheet.Status switch
            {
                1 => "Đi làm",
                2 => "Nghỉ",
                3 => "Xin nghỉ",
                4 => "Di chuyển",
                5 => "Làm visa",
                6 => "Đào tạo",
                7 => "Mở quyền hạn",
                _ => timesheet.Status.ToString()
            };

                // Column G: Area name
                if (timesheet.AreaId.HasValue)
                {
                    var area = areas.FirstOrDefault(a => a.AreaId == timesheet.AreaId.Value);
                    sheet.Cells[row, 7].Value = area?.Name ?? "";
                }

                // Column H: Status code
                sheet.Cells[row, 8].Value = timesheet.Status;

                // Column I: If Sunday, show 非个人原因, otherwise based on absence_type
                if (timesheet.DayOfWeek == 1) // Sunday
                {
                    sheet.Cells[row, 9].Value = "非个人原因";
                }
                else if (timesheet.AbsenceType.HasValue)
                {
                    sheet.Cells[row, 9].Value = timesheet.AbsenceType == 0 ? "个人原因" : "非个人原因";
                }

                // Column J: Absence reason - if absence_type = 0 then 个人原因, absence_type = 1 then 非个人原因
                if (timesheet.AbsenceType.HasValue)
                {
                    sheet.Cells[row, 10].Value = timesheet.AbsenceType == 0 ? "个人原因" : "非个人原因";
                }
                else
                {
                    sheet.Cells[row, 10].Value = "";
                }

                // Column K: Notes
                sheet.Cells[row, 11].Value = timesheet.Notes ?? "";

                // Column L: Type (中干 for Sheet2)
                sheet.Cells[row, 12].Value = "中干";

                // Apply border to data rows
                for (int col = 1; col <= 12; col++)
                {
                    sheet.Cells[row, col].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                }

                row++;
            }
        }

        // Auto-fit columns
        sheet.Cells.AutoFitColumns();
        return Task.CompletedTask;
    }

    private Task CreateSheet3(OfficeOpenXml.ExcelWorksheet sheet, List<EmployeeModel> employees, List<Timesheet> allTimesheets, List<Area> areas)
    {
        // Set font for all cells
        sheet.Cells.Style.Font.Name = "宋体";
        sheet.Cells.Style.Font.Size = 10;

        // Row 1: Title (merge A1-L1)
        sheet.Cells[1, 1, 1, 12].Merge = true;
        sheet.Cells[1, 1].Value = "越南光州厂区";
        sheet.Cells[1, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
        sheet.Cells[1, 1].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
        sheet.Cells[1, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
        sheet.Cells[1, 1].Style.Font.Bold = true;
        sheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
        
        // Apply fill color to all merged cells in row 1
        for (int col = 1; col <= 12; col++)
        {
            sheet.Cells[1, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153));
        }

        // Row 2: Headers (same as Sheet2)
        sheet.Cells[2, 1].Value = "姓名";
        sheet.Cells[2, 2].Value = "星期";
        sheet.Cells[2, 3].Value = "日期";
        sheet.Cells[2, 4].Value = "上班时间";
        sheet.Cells[2, 5].Value = "夜班天数";
        sheet.Cells[2, 6].Value = "出勤情况";
        sheet.Cells[2, 7].Value = "出差\n区域";
        sheet.Cells[2, 8].Value = "国外实际出勤天数";
        sheet.Cells[2, 9].Value = "未出勤是个人原因\n或非个人原因";
        sheet.Cells[2, 10].Value = "未出勤原因\n详细说明";
        sheet.Cells[2, 11].Value = "备注";
        sheet.Cells[2, 12].Value = "类型";

        // Apply header style (row 1 and 2) - Orange Accent 2 Lighter 60% RGB(255, 204, 153)
        sheet.Cells[1, 1].Style.Font.Bold = true;
        for (int col = 1; col <= 12; col++)
        {
            sheet.Cells[1, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
            sheet.Cells[2, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            sheet.Cells[2, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(255, 204, 153)); // Orange Accent 2 Lighter 60%
            sheet.Cells[2, col].Style.Font.Bold = true;
            sheet.Cells[2, col].Style.WrapText = true;
        }

        // Data rows starting from row 3
        int row = 3;
        foreach (var emp in employees)
        {
            var employeeTimesheets = allTimesheets.Where(t => t.EmployeeId == emp.EmployeeId).OrderBy(t => t.Day).ToList();
            
            foreach (var timesheet in employeeTimesheets)
            {
                // Column A: Employee name
                sheet.Cells[row, 1].Value = emp.Fullname ?? emp.FullnameOther ?? "";

                // Column B: Day of week (English)
                if (timesheet.DayOfWeek.HasValue)
                {
                    sheet.Cells[row, 2].Value = GetDayOfWeekEnglish(timesheet.DayOfWeek.Value);
                }

                // Column C: Date
                sheet.Cells[row, 3].Value = timesheet.Day.ToString("yyyy-MM-dd");

                // Column D: Work time (work_start - work_end)
                if (timesheet.WorkStart.HasValue && timesheet.WorkEnd.HasValue)
                {
                    sheet.Cells[row, 4].Value = $"{timesheet.WorkStart.Value:HH:mm}-{timesheet.WorkEnd.Value:HH:mm}";
                }

                // Column E: Night shift (1 if work time overlaps with 18:00-7:00)
                int nightShift = 0;
                if (timesheet.WorkStart.HasValue && timesheet.WorkEnd.HasValue)
                {
                    var startTime = timesheet.WorkStart.Value;
                    var endTime = timesheet.WorkEnd.Value;
                    
                    // Check if work time overlaps with night shift (18:00-7:00)
                    // Night shift spans from 18:00 to next day 7:00
                    var nightStart = new TimeOnly(18, 0);
                    var nightEnd = new TimeOnly(7, 0);
                    
                    // If work spans midnight (end < start), check both parts
                    if (endTime < startTime)
                    {
                        // Work spans midnight, check if overlaps with night shift
                        if (startTime >= nightStart || endTime <= nightEnd)
                        {
                            nightShift = 1;
                        }
                    }
                    else
                    {
                        // Normal work day, check if overlaps with 18:00-24:00 or 0:00-7:00
                        if ((startTime >= nightStart && startTime <= new TimeOnly(23, 59)) ||
                            (endTime <= nightEnd && endTime >= new TimeOnly(0, 0)) ||
                            (startTime <= nightEnd && endTime >= nightStart))
                        {
                            nightShift = 1;
                        }
                    }
                }
                sheet.Cells[row, 5].Value = nightShift;

                // Column F: Status (在勤 = 1, 休息 = 2)
            sheet.Cells[row, 6].Value = timesheet.Status switch
            {
                1 => "Đi làm",
                2 => "Nghỉ",
                3 => "Xin nghỉ",
                4 => "Di chuyển",
                5 => "Làm visa",
                6 => "Đào tạo",
                7 => "Mở quyền hạn",
                _ => timesheet.Status.ToString()
            };

                // Column G: Area name
                if (timesheet.AreaId.HasValue)
                {
                    var area = areas.FirstOrDefault(a => a.AreaId == timesheet.AreaId.Value);
                    sheet.Cells[row, 7].Value = area?.Name ?? "";
                }

                // Column H: Actual work days (1 if status = 1)
            sheet.Cells[row, 8].Value = timesheet.Status;

                // Column I: If Sunday, show 非个人原因, otherwise based on absence_type
                if (timesheet.DayOfWeek == 1) // Sunday
                {
                    sheet.Cells[row, 9].Value = "非个人原因";
                }
                else if (timesheet.AbsenceType.HasValue)
                {
                    sheet.Cells[row, 9].Value = timesheet.AbsenceType == 0 ? "个人原因" : "非个人原因";
                }

                // Column J: Absence reason - if absence_type = 0 then 个人原因, absence_type = 1 then 非个人原因
                if (timesheet.AbsenceType.HasValue)
                {
                    sheet.Cells[row, 10].Value = timesheet.AbsenceType == 0 ? "个人原因" : "非个人原因";
                }
                else
                {
                    sheet.Cells[row, 10].Value = "";
                }

                // Column K: Notes
                sheet.Cells[row, 11].Value = timesheet.Notes ?? "";

                // Column L: Type (越干 for Sheet3)
                sheet.Cells[row, 12].Value = "越干";

                // Apply border to data rows
                for (int col = 1; col <= 12; col++)
                {
                    sheet.Cells[row, col].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    sheet.Cells[row, col].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                }

                row++;
            }
        }

        // Auto-fit columns
        sheet.Cells.AutoFitColumns();
        return Task.CompletedTask;
    }

    private string GetDayOfWeekEnglish(byte dayOfWeek)
    {
        return dayOfWeek switch
        {
            1 => "Sunday",
            2 => "Monday",
            3 => "Tuesday",
            4 => "Wednesday",
            5 => "Thursday",
            6 => "Friday",
            7 => "Saturday",
            _ => ""
        };
    }

}

