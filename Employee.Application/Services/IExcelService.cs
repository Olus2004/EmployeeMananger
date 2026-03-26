using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IExcelService
{
    Task<IEnumerable<ExcelViewModel>> GetAllExcelsAsync();
    Task<IEnumerable<ExcelViewModel>> GetRecentUploadsAsync(int count = 10);
    Task<ExcelViewModel?> GetExcelByIdAsync(int id);
    Task<ExcelViewModel> CreateExcelAsync(CreateExcelViewModel model);
    Task<bool> DeleteExcelAsync(int id);
    Task<ImportResultViewModel> ImportExcelAsync(Stream fileStream, string fileName, bool importEmployees = true, bool importTimesheets = true);
    Task<ExportResultViewModel> ExportExcelAsync(int? year = null, int? month = null, DateOnly? startDate = null, DateOnly? endDate = null);
}

