using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;
    private readonly ILogger<BackupController> _logger;

    public BackupController(IBackupService backupService, ILogger<BackupController> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBackups()
    {
        try
        {
            var backups = await _backupService.GetAllBackupsAsync();
            return Ok(backups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách backup");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách backup", error = ex.Message });
        }
    }

    [HttpPost("restore/{id}")]
    public async Task<IActionResult> RestoreBackup(int id)
    {
        try
        {
            var result = await _backupService.RestoreBackupAsync(id);
            
            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi khôi phục backup");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi khôi phục backup", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBackup(int id)
    {
        try
        {
            var result = await _backupService.DeleteBackupAsync(id);
            
            if (result)
            {
                return Ok(new { message = "Xóa backup thành công" });
            }
            else
            {
                return NotFound(new { message = "Không tìm thấy backup" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa backup");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa backup", error = ex.Message });
        }
    }
}

