using System.Text.Json;
using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using EmployeeModel = Employee.Core.Models.Employee;

namespace Employee.Application.Services;

public class BackupService : IBackupService
{
    private readonly IBackupRepository _backupRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITimesheetRepository _timesheetRepository;
    private readonly IAreaRepository _areaRepository;
    private readonly IFeedbackRepository _feedbackRepository;

    public BackupService(
        IBackupRepository backupRepository,
        IEmployeeRepository employeeRepository,
        ITimesheetRepository timesheetRepository,
        IAreaRepository areaRepository,
        IFeedbackRepository feedbackRepository)
    {
        _backupRepository = backupRepository;
        _employeeRepository = employeeRepository;
        _timesheetRepository = timesheetRepository;
        _areaRepository = areaRepository;
        _feedbackRepository = feedbackRepository;
    }

    public async Task<BackupResultViewModel> CreateBackupAsync(string excelFileName, string? description = null)
    {
        try
        {
            // Load all data
            var employees = (await _employeeRepository.GetAllAsync()).ToList();
            var timesheets = (await _timesheetRepository.GetAllAsync()).ToList();
            var areas = (await _areaRepository.GetAllAsync()).ToList();
            var feedbacks = (await _feedbackRepository.GetAllAsync()).ToList();

            // Create backup data object
            var backupData = new
            {
                Employees = employees,
                Timesheets = timesheets,
                Areas = areas,
                Feedbacks = feedbacks,
                BackupTime = DateTime.Now
            };

            // Serialize to JSON
            var dataJson = JsonSerializer.Serialize(backupData, new JsonSerializerOptions
            {
                WriteIndented = false
            });

            // Create backup name
            var backupName = $"Backup_{DateTime.Now:yyyyMMdd_HHmmss}";

            // Create backup entity
            var backup = new Backup
            {
                BackupName = backupName,
                Description = description ?? $"Backup trước khi import: {excelFileName}",
                ExcelFileName = excelFileName,
                DataJson = dataJson,
                CreatedAt = DateTime.Now
            };

            await _backupRepository.AddAsync(backup);

            return new BackupResultViewModel
            {
                Success = true,
                Message = "Backup thành công",
                BackupId = backup.BackupId
            };
        }
        catch (Exception ex)
        {
            return new BackupResultViewModel
            {
                Success = false,
                Message = $"Lỗi khi tạo backup: {ex.Message}"
            };
        }
    }

    public async Task<RestoreResultViewModel> RestoreBackupAsync(int backupId)
    {
        try
        {
            var backup = await _backupRepository.GetByIdAsync(backupId);
            if (backup == null)
            {
                return new RestoreResultViewModel
                {
                    Success = false,
                    Message = "Không tìm thấy backup"
                };
            }

            // Deserialize backup data
            var backupData = JsonSerializer.Deserialize<BackupData>(backup.DataJson);
            if (backupData == null)
            {
                return new RestoreResultViewModel
                {
                    Success = false,
                    Message = "Dữ liệu backup không hợp lệ"
                };
            }

            // Clear existing data (in reverse order of dependencies)
            var allFeedbacks = (await _feedbackRepository.GetAllAsync()).ToList();
            foreach (var feedback in allFeedbacks)
            {
                await _feedbackRepository.DeleteAsync(feedback);
            }

            var allTimesheets = (await _timesheetRepository.GetAllAsync()).ToList();
            foreach (var timesheet in allTimesheets)
            {
                await _timesheetRepository.DeleteAsync(timesheet);
            }

            var allEmployees = (await _employeeRepository.GetAllAsync()).ToList();
            foreach (var employee in allEmployees)
            {
                await _employeeRepository.DeleteAsync(employee);
            }

            // Note: We don't delete areas as they might be used by other data
            // Instead, we restore areas that were in the backup

            // Create mapping for areas (old ID -> new ID)
            var areaIdMap = new Dictionary<int, int>();
            var existingAreas = (await _areaRepository.GetAllAsync()).ToList();
            
            // Restore areas and create mapping
            foreach (var area in backupData.Areas)
            {
                var existing = existingAreas.FirstOrDefault(a => a.Name.Equals(area.Name, StringComparison.OrdinalIgnoreCase));
                if (existing != null)
                {
                    // Update existing area
                    existing.Description = area.Description;
                    existing.Active = area.Active;
                    existing.UpdatedAt = DateTime.Now;
                    await _areaRepository.UpdateAsync(existing);
                    areaIdMap[area.AreaId] = existing.AreaId;
                }
                else
                {
                    // Create new area (let database assign new ID)
                    var newArea = new Area
                    {
                        Name = area.Name,
                        Description = area.Description,
                        Active = area.Active,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    await _areaRepository.AddAsync(newArea);
                    // Get the new ID after save
                    areaIdMap[area.AreaId] = newArea.AreaId;
                }
            }

            // Create mapping for employees (old ID -> new ID)
            var employeeIdMap = new Dictionary<int, int>();
            
            // Restore employees
            foreach (var employee in backupData.Employees)
            {
                var newEmployee = new EmployeeModel
                {
                    Fullname = employee.Fullname,
                    FullnameOther = employee.FullnameOther,
                    Type = employee.Type,
                    Active = employee.Active,
                    Sale = employee.Sale,
                    WorkDays = employee.WorkDays,
                    TravelDays = employee.TravelDays,
                    LeaveDays = employee.LeaveDays,
                    UnauthorizedLeave = employee.UnauthorizedLeave,
                    VisaExtension = employee.VisaExtension,
                    PermissionGranted = employee.PermissionGranted,
                    NightShiftDays = employee.NightShiftDays,
                    TrainingDays = employee.TrainingDays,
                    TotalDays = employee.TotalDays,
                    AreaId = employee.AreaId.HasValue && areaIdMap.ContainsKey(employee.AreaId.Value) 
                        ? areaIdMap[employee.AreaId.Value] 
                        : employee.AreaId,
                    PlantName = employee.PlantName,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                await _employeeRepository.AddAsync(newEmployee);
                employeeIdMap[employee.EmployeeId] = newEmployee.EmployeeId;
            }

            // Create mapping for timesheets (old ID -> new ID)
            var timesheetIdMap = new Dictionary<int, int>();

            // Restore timesheets
            foreach (var timesheet in backupData.Timesheets)
            {
                if (!employeeIdMap.ContainsKey(timesheet.EmployeeId))
                    continue; // Skip if employee mapping not found

                var newTimesheet = new Timesheet
                {
                    EmployeeId = employeeIdMap[timesheet.EmployeeId],
                    Day = timesheet.Day,
                    DayOfWeek = timesheet.DayOfWeek,
                    WorkStart = timesheet.WorkStart,
                    WorkEnd = timesheet.WorkEnd,
                    Status = timesheet.Status,
                    AbsenceType = timesheet.AbsenceType,
                    AbsenceReason = timesheet.AbsenceReason,
                    Notes = timesheet.Notes,
                    AreaId = timesheet.AreaId.HasValue && areaIdMap.ContainsKey(timesheet.AreaId.Value)
                        ? areaIdMap[timesheet.AreaId.Value]
                        : timesheet.AreaId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                await _timesheetRepository.AddAsync(newTimesheet);
                timesheetIdMap[timesheet.TimesheetId] = newTimesheet.TimesheetId;
            }

            // Restore feedbacks
            foreach (var feedback in backupData.Feedbacks)
            {
                if (!employeeIdMap.ContainsKey(feedback.EmployeeId) || 
                    !timesheetIdMap.ContainsKey(feedback.TimesheetId))
                    continue; // Skip if mappings not found

                var newFeedback = new Feedback
                {
                    EmployeeId = employeeIdMap[feedback.EmployeeId],
                    TimesheetId = timesheetIdMap[feedback.TimesheetId],
                    Description = feedback.Description,
                    SubmittedAt = feedback.SubmittedAt,
                    AdminResponse = feedback.AdminResponse,
                    RespondedAt = feedback.RespondedAt,
                    Status = feedback.Status,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                await _feedbackRepository.AddAsync(newFeedback);
            }

            // Update backup restored time
            backup.RestoredAt = DateTime.Now;
            await _backupRepository.UpdateAsync(backup);

            return new RestoreResultViewModel
            {
                Success = true,
                Message = "Khôi phục backup thành công"
            };
        }
        catch (Exception ex)
        {
            return new RestoreResultViewModel
            {
                Success = false,
                Message = $"Lỗi khi khôi phục backup: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<BackupViewModel>> GetAllBackupsAsync()
    {
        var backups = await _backupRepository.GetAllOrderedByDateDescAsync();
        
        return backups.Select(b =>
        {
            // Parse JSON to get counts
            int employeeCount = 0, timesheetCount = 0, areaCount = 0, feedbackCount = 0;
            try
            {
                var data = JsonSerializer.Deserialize<BackupData>(b.DataJson);
                if (data != null)
                {
                    employeeCount = data.Employees?.Count ?? 0;
                    timesheetCount = data.Timesheets?.Count ?? 0;
                    areaCount = data.Areas?.Count ?? 0;
                    feedbackCount = data.Feedbacks?.Count ?? 0;
                }
            }
            catch
            {
                // Ignore parse errors
            }

            return new BackupViewModel
            {
                BackupId = b.BackupId,
                BackupName = b.BackupName,
                Description = b.Description,
                ExcelFileName = b.ExcelFileName,
                CreatedAt = b.CreatedAt,
                RestoredAt = b.RestoredAt,
                EmployeeCount = employeeCount,
                TimesheetCount = timesheetCount,
                AreaCount = areaCount,
                FeedbackCount = feedbackCount
            };
        });
    }

    public async Task<bool> DeleteBackupAsync(int backupId)
    {
        try
        {
            var backup = await _backupRepository.GetByIdAsync(backupId);
            if (backup == null)
                return false;

            await _backupRepository.DeleteAsync(backup);
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Helper class for deserialization
    private class BackupData
    {
        public List<EmployeeModel> Employees { get; set; } = new();
        public List<Timesheet> Timesheets { get; set; } = new();
        public List<Area> Areas { get; set; } = new();
        public List<Feedback> Feedbacks { get; set; } = new();
        public DateTime BackupTime { get; set; }
    }
}

