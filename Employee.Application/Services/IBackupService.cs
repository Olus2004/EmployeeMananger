using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IBackupService
{
    Task<BackupResultViewModel> CreateBackupAsync(string excelFileName, string? description = null);
    Task<RestoreResultViewModel> RestoreBackupAsync(int backupId);
    Task<IEnumerable<BackupViewModel>> GetAllBackupsAsync();
    Task<bool> DeleteBackupAsync(int backupId);
}

