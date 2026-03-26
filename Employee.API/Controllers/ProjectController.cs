using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ILogger<ProjectController> _logger;

    public ProjectController(IProjectService projectService, ILogger<ProjectController> logger)
    {
        _projectService = projectService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects()
    {
        try
        {
            var projects = await _projectService.GetAllProjectsAsync();
            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách dự án" });
        }
    }

    [HttpGet("month/{month}")]
    public async Task<IActionResult> GetAllProjectsWithMonthlyCount(string month)
    {
        try
        {
            if (!DateOnly.TryParse(month, out var monthValue))
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM-dd)" });

            var projects = await _projectService.GetAllProjectsWithMonthlyCountAsync(monthValue);
            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách dự án theo tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách dự án" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(int id)
    {
        try
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
            {
                return NotFound(new { message = "Không tìm thấy dự án" });
            }
            return Ok(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin dự án" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.ProjectName))
            {
                return BadRequest(new { message = "Tên dự án không được để trống" });
            }

            if (string.IsNullOrEmpty(model.ProjectCode))
            {
                return BadRequest(new { message = "Mã dự án không được để trống" });
            }

            var project = await _projectService.CreateProjectAsync(model);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.ProjectId }, project);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi validation khi tạo dự án");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo dự án" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.ProjectName))
            {
                return BadRequest(new { message = "Tên dự án không được để trống" });
            }

            if (string.IsNullOrEmpty(model.ProjectCode))
            {
                return BadRequest(new { message = "Mã dự án không được để trống" });
            }

            var project = await _projectService.UpdateProjectAsync(id, model);
            if (project == null)
            {
                return NotFound(new { message = "Không tìm thấy dự án" });
            }
            return Ok(project);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi validation khi cập nhật dự án");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật dự án" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        try
        {
            var result = await _projectService.DeleteProjectAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy dự án" });
            }
            return Ok(new { message = "Xóa dự án thành công" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi validation khi xóa dự án");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa dự án" });
        }
    }

    [HttpGet("{id}/employees")]
    public async Task<IActionResult> GetEmployeesByProjectId(int id)
    {
        try
        {
            var employees = await _projectService.GetEmployeesByProjectIdAsync(id);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo dự án");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    [HttpGet("{id}/employees/date/{date}")]
    public async Task<IActionResult> GetEmployeesByProjectIdAndDate(int id, string date)
    {
        try
        {
            if (!DateOnly.TryParse(date, out var dateValue))
            {
                return BadRequest(new { message = "Định dạng ngày không hợp lệ" });
            }

            var employees = await _projectService.GetEmployeesByProjectIdAndDateAsync(id, dateValue);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo dự án và ngày");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    [HttpGet("{id}/employees/date/{date}/status")]
    public async Task<IActionResult> GetEmployeesByProjectIdAndDateWithStatus(int id, string date, [FromQuery] short? status = null)
    {
        try
        {
            if (!DateOnly.TryParse(date, out var dateValue))
            {
                return BadRequest(new { message = "Định dạng ngày không hợp lệ" });
            }

            var employees = await _projectService.GetEmployeesByProjectIdAndDateWithStatusAsync(id, dateValue, status);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo dự án, ngày và trạng thái");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách nhân viên" });
        }
    }

    // ==================== Project Month Endpoints ====================

    [HttpGet("{id}/month/{month}/employees")]
    public async Task<IActionResult> GetProjectMonthEmployees(int id, string month)
    {
        try
        {
            if (!DateOnly.TryParse(month, out var monthValue))
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM-dd)" });

            var employees = await _projectService.GetProjectMonthEmployeesAsync(id, monthValue);
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên theo dự án và tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi" });
        }
    }

    [HttpPost("{id}/month/{month}/employees")]
    public async Task<IActionResult> AddEmployeeToProjectMonth(int id, string month, [FromBody] AddProjectMonthEmployeeRequest request)
    {
        try
        {
            if (!DateOnly.TryParse(month, out var monthValue))
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM-dd)" });

            await _projectService.AddEmployeeToProjectMonthAsync(id, request.EmployeeId, monthValue);
            return Ok(new { message = "Thêm nhân viên vào dự án tháng thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi thêm nhân viên vào dự án tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi" });
        }
    }

    [HttpDelete("{id}/month/{month}/employees/{employeeId}")]
    public async Task<IActionResult> RemoveEmployeeFromProjectMonth(int id, string month, int employeeId)
    {
        try
        {
            if (!DateOnly.TryParse(month, out var monthValue))
                return BadRequest(new { message = "Định dạng tháng không hợp lệ (yyyy-MM-dd)" });

            await _projectService.RemoveEmployeeFromProjectMonthAsync(id, employeeId, monthValue);
            return Ok(new { message = "Xóa nhân viên khỏi dự án tháng thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa nhân viên khỏi dự án tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi" });
        }
    }
}

public class AddProjectMonthEmployeeRequest
{
    public int EmployeeId { get; set; }
}
