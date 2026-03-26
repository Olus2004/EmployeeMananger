using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimesheetController : ControllerBase
{
    private readonly ITimesheetService _timesheetService;
    private readonly ILogger<TimesheetController> _logger;

    public TimesheetController(ITimesheetService timesheetService, ILogger<TimesheetController> logger)
    {
        _timesheetService = timesheetService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTimesheets()
    {
        try
        {
            var timesheets = await _timesheetService.GetAllTimesheetsAsync();
            return Ok(timesheets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bảng công" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTimesheetById(int id)
    {
        try
        {
            var timesheet = await _timesheetService.GetTimesheetByIdAsync(id);
            if (timesheet == null)
            {
                return NotFound(new { message = "Không tìm thấy bảng công" });
            }
            return Ok(timesheet);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin bảng công" });
        }
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetTimesheetsByEmployee(int employeeId)
    {
        try
        {
            var timesheets = await _timesheetService.GetTimesheetsByEmployeeIdAsync(employeeId);
            return Ok(timesheets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách bảng công theo nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bảng công theo nhân viên" });
        }
    }

    [HttpGet("date-range")]
    public async Task<IActionResult> GetTimesheetsByDateRange([FromQuery] string startDate, [FromQuery] string endDate)
    {
        try
        {
            if (!DateOnly.TryParse(startDate, out var start) || !DateOnly.TryParse(endDate, out var end))
            {
                return BadRequest(new { message = "Định dạng ngày không hợp lệ" });
            }

            var timesheets = await _timesheetService.GetTimesheetsByDateRangeAsync(start, end);
            return Ok(timesheets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách bảng công theo khoảng thời gian");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bảng công theo khoảng thời gian" });
        }
    }

    [HttpGet("employee/{employeeId}/date-range")]
    public async Task<IActionResult> GetTimesheetsByEmployeeAndDateRange(int employeeId, [FromQuery] string startDate, [FromQuery] string endDate)
    {
        try
        {
            if (!DateOnly.TryParse(startDate, out var start) || !DateOnly.TryParse(endDate, out var end))
            {
                return BadRequest(new { message = "Định dạng ngày không hợp lệ" });
            }

            var timesheets = await _timesheetService.GetTimesheetsByEmployeeAndDateRangeAsync(employeeId, start, end);
            return Ok(timesheets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách bảng công theo nhân viên và khoảng thời gian");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách bảng công theo nhân viên và khoảng thời gian" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateTimesheet([FromBody] CreateTimesheetViewModel model)
    {
        try
        {
            var timesheet = await _timesheetService.CreateTimesheetAsync(model);
            return CreatedAtAction(nameof(GetTimesheetById), new { id = timesheet.TimesheetId }, timesheet);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo bảng công" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTimesheet(int id, [FromBody] UpdateTimesheetViewModel model)
    {
        try
        {
            var timesheet = await _timesheetService.UpdateTimesheetAsync(id, model);
            if (timesheet == null)
            {
                return NotFound(new { message = "Không tìm thấy bảng công" });
            }
            return Ok(timesheet);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật bảng công" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimesheet(int id)
    {
        try
        {
            var result = await _timesheetService.DeleteTimesheetAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy bảng công" });
            }
            return Ok(new { message = "Xóa bảng công thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa bảng công" });
        }
    }
}

