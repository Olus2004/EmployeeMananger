using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExcelController : ControllerBase
{
    private readonly IExcelService _excelService;
    private readonly ILogger<ExcelController> _logger;

    public ExcelController(IExcelService excelService, ILogger<ExcelController> logger)
    {
        _excelService = excelService;
        _logger = logger;
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportExcel(IFormFile file, [FromForm] bool importEmployees = true, [FromForm] bool importTimesheets = true)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file Excel để import" });
            }

            // Validate file extension
            var allowedExtensions = new[] { ".xlsx", ".xls" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "File phải có định dạng .xlsx hoặc .xls" });
            }

            using var stream = file.OpenReadStream();
            var result = await _excelService.ImportExcelAsync(stream, file.FileName, importEmployees, importTimesheets);

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
            _logger.LogError(ex, "Lỗi khi import Excel");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi import Excel", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllExcels()
    {
        try
        {
            var excels = await _excelService.GetAllExcelsAsync();
            return Ok(excels);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách Excel");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách Excel", error = ex.Message });
        }
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportExcel(int? year = null, int? month = null, string? startDate = null, string? endDate = null)
    {
        try
        {
            DateOnly? startDateOnly = null;
            DateOnly? endDateOnly = null;
            
            if (!string.IsNullOrWhiteSpace(startDate) && DateOnly.TryParse(startDate, out var start))
            {
                startDateOnly = start;
            }
            
            if (!string.IsNullOrWhiteSpace(endDate) && DateOnly.TryParse(endDate, out var end))
            {
                endDateOnly = end;
            }
            
            var result = await _excelService.ExportExcelAsync(year, month, startDateOnly, endDateOnly);
            
            if (result.Success && result.FileContent != null)
            {
                var fileName = result.FileName ?? "export.xlsx";
                return File(result.FileContent, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            else
            {
                return BadRequest(new { message = result.Message });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi export Excel");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi export Excel", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExcel(int id)
    {
        try
        {
            var result = await _excelService.DeleteExcelAsync(id);
            
            if (result)
            {
                return Ok(new { message = "Xóa thành công" });
            }
            else
            {
                return NotFound(new { message = "Không tìm thấy bản ghi Excel" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa Excel");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa Excel", error = ex.Message });
        }
    }
}

