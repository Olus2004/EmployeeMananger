using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyController : ControllerBase
{
    private readonly IDailyService _dailyService;
    private readonly ILogger<DailyController> _logger;

    public DailyController(IDailyService dailyService, ILogger<DailyController> logger)
    {
        _dailyService = dailyService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetDailiesByDay([FromQuery] string? day = null)
    {
        try
        {
            DateOnly queryDay = day != null ? DateOnly.Parse(day) : DateOnly.FromDateTime(DateTime.Now);
            var dailies = await _dailyService.GetDailiesByDayAsync(queryDay);
            return Ok(dailies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách điểm danh theo ngày");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách điểm danh" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDailyById(int id)
    {
        try
        {
            var daily = await _dailyService.GetDailyByIdAsync(id);
            if (daily == null) return NotFound(new { message = "Không tìm thấy bản ghi điểm danh" });
            return Ok(daily);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin điểm danh");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin điểm danh" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateDaily([FromBody] CreateDailyViewModel model)
    {
        try
        {
            var daily = await _dailyService.CreateDailyAsync(model);
            return CreatedAtAction(nameof(GetDailyById), new { id = daily.DailyId }, daily);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo bản ghi điểm danh");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo bản ghi điểm danh: " + ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDaily(int id, [FromBody] UpdateDailyViewModel model)
    {
        try
        {
            var daily = await _dailyService.UpdateDailyAsync(id, model);
            if (daily == null) return NotFound(new { message = "Không tìm thấy bản ghi điểm danh" });
            return Ok(daily);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật bản ghi điểm danh");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật bản ghi điểm danh" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDaily(int id)
    {
        try
        {
            var result = await _dailyService.DeleteDailyAsync(id);
            if (!result) return NotFound(new { message = "Không tìm thấy bản ghi điểm danh" });
            return Ok(new { message = "Xóa bản ghi điểm danh thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa bản ghi điểm danh");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa bản ghi điểm danh" });
        }
    }

    [HttpGet("initialize")]
    public async Task<IActionResult> GetInitialDailyList([FromQuery] string? day = null)
    {
        try
        {
            DateOnly queryDay = day != null ? DateOnly.Parse(day) : DateOnly.FromDateTime(DateTime.Now);
            var dailies = await _dailyService.GetInitialDailyListAsync(queryDay);
            return Ok(dailies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi khởi tạo danh sách điểm danh");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi khởi tạo danh sách điểm danh" });
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetMonthlyStats([FromQuery] string? day = null)
    {
        try
        {
            DateOnly queryDay = day != null ? DateOnly.Parse(day) : DateOnly.FromDateTime(DateTime.Now);
            var stats = await _dailyService.GetMonthlyStatsAsync(queryDay);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thống kê điểm danh theo tháng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thống kê" });
        }
    }

    [HttpPost("{id}/sync")]
    public async Task<IActionResult> SyncToTimesheet(int id)
    {
        try
        {
            var result = await _dailyService.SyncToTimesheetAsync(id);
            if (!result) return NotFound(new { message = "Không tìm thấy bản ghi điểm danh để đồng bộ" });
            return Ok(new { message = "Đồng bộ bảng công thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đồng bộ bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi đồng bộ bảng công: " + ex.Message });
        }
    }
}
