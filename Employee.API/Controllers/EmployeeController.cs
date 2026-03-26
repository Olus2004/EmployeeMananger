using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;
using IEmployeeStatsRecalculationService = Employee.Application.Services.IEmployeeStatsRecalculationService;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly IEmployeeStatsRecalculationService _recalculationService;
    private readonly ILogger<EmployeeController> _logger;

    public EmployeeController(
        IEmployeeService employeeService, 
        IEmployeeStatsRecalculationService recalculationService,
        ILogger<EmployeeController> logger)
    {
        _employeeService = employeeService;
        _recalculationService = recalculationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        try
        {
            var employees = await _employeeService.GetAllEmployeesAsync();
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveEmployees()
    {
        try
        {
            var employees = await _employeeService.GetActiveEmployeesAsync();
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên đang hoạt động");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên đang hoạt động" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(int id, [FromQuery] string? month = null)
    {
        try
        {
            DateOnly? dateMonth = null;
            if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month, "yyyy-MM", out var parsedMonth))
            {
                dateMonth = parsedMonth;
            }

            var employee = await _employeeService.GetEmployeeByIdAsync(id, dateMonth);
            if (employee == null)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }
            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin nhân viên" });
        }
    }

    [HttpGet("{id}/projects/month/{month}")]
    public async Task<IActionResult> GetEmployeeProjectsByMonth(int id, string month)
    {
        try
        {
            if (!DateOnly.TryParseExact(month, "yyyy-MM", out var dateMonth))
            {
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM)" });
            }

            var projects = await _employeeService.GetEmployeeProjectsByMonthAsync(id, dateMonth);
            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách dự án của nhân viên theo tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách dự án" });
        }
    }

    [HttpPost("{id}/projects/month/{month}")]
    public async Task<IActionResult> AddProjectToEmployeeMonth(int id, string month, [FromBody] int projectId)
    {
        try
        {
            if (!DateOnly.TryParseExact(month, "yyyy-MM", out var dateMonth))
            {
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM)" });
            }

            await _employeeService.AddProjectToEmployeeMonthAsync(id, projectId, dateMonth);
            return Ok(new { message = "Đã gán nhân viên vào dự án trong tháng thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gán nhân viên vào dự án trong tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi gán nhân viên vào dự án" });
        }
    }

    [HttpDelete("{id}/projects/{projectId}/month/{month}")]
    public async Task<IActionResult> RemoveProjectFromEmployeeMonth(int id, int projectId, string month)
    {
        try
        {
            if (!DateOnly.TryParseExact(month, "yyyy-MM", out var dateMonth))
            {
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM)" });
            }

            await _employeeService.RemoveProjectFromEmployeeMonthAsync(id, projectId, dateMonth);
            return Ok(new { message = "Đã xóa nhân viên khỏi dự án trong tháng thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa nhân viên khỏi dự án trong tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa nhân viên khỏi dự án" });
        }
    }

    [HttpGet("area/{areaId}")]
    public async Task<IActionResult> GetEmployeesByArea(int areaId)
    {
        try
        {
            var employees = await _employeeService.GetEmployeesByAreaIdAsync(areaId);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên theo khu vực" });
        }
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetEmployeesByType(short type)
    {
        try
        {
            var employees = await _employeeService.GetEmployeesByTypeAsync(type);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo loại");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên theo loại" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeViewModel model, [FromQuery] string? month = null)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Fullname) && string.IsNullOrEmpty(model.FullnameOther))
            {
                return BadRequest(new { message = "Họ tên hoặc họ tên nước ngoài không được để trống" });
            }

            DateOnly? dateMonth = null;
            if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month, "yyyy-MM", out var parsedMonth))
            {
                dateMonth = parsedMonth;
            }

            var employee = await _employeeService.CreateEmployeeAsync(model, dateMonth);
            return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.EmployeeId }, employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo nhân viên" });
        }
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeViewModel model, [FromQuery] string? month = null)
    {
        try
        {
            DateOnly? dateMonth = null;
            if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month, "yyyy-MM", out var parsedMonth))
            {
                dateMonth = parsedMonth;
            }

            var employee = await _employeeService.UpdateEmployeeAsync(id, model, dateMonth);
            if (employee == null)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }
            return Ok(employee);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật nhân viên" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        try
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }
            return Ok(new { message = "Xóa nhân viên thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa nhân viên" });
        }
    }

    [HttpPost("recalculate-all")]
    public async Task<IActionResult> RecalculateAllEmployeesStats()
    {
        try
        {
            await _recalculationService.RecalculateAllEmployeesStatsAsync();
            return Ok(new { message = "Đã tính toán và cập nhật thống kê tất cả nhân viên thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tính toán lại thống kê tất cả nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tính toán lại thống kê" });
        }
    }

    [HttpPost("{id}/recalculate")]
    public async Task<IActionResult> RecalculateEmployeeStats(int id)
    {
        try
        {
            var result = await _employeeService.RecalculateEmployeeStatsAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy nhân viên" });
            }
            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            return Ok(new { message = "Tính toán lại thống kê thành công", employee });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tính toán lại thống kê nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tính toán lại thống kê" });
        }
    }
}

