using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData([FromQuery] string? day = null)
    {
        try
        {
            DateOnly? date = null;
            if (!string.IsNullOrEmpty(day) && DateOnly.TryParse(day, out var parsedDate))
            {
                date = parsedDate;
            }

            var dashboardData = await _dashboardService.GetDashboardDataAsync(date);
            return Ok(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy dữ liệu dashboard");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy dữ liệu dashboard" });
        }
    }
}

