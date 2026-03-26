using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AreaController : ControllerBase
{
    private readonly IAreaService _areaService;
    private readonly ILogger<AreaController> _logger;

    public AreaController(IAreaService areaService, ILogger<AreaController> logger)
    {
        _areaService = areaService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAreas()
    {
        try
        {
            var areas = await _areaService.GetAllAreasAsync();
            return Ok(areas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách khu vực" });
        }
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveAreas()
    {
        try
        {
            var areas = await _areaService.GetActiveAreasAsync();
            return Ok(areas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách khu vực đang hoạt động");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách khu vực đang hoạt động" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAreaById(int id)
    {
        try
        {
            var area = await _areaService.GetAreaByIdAsync(id);
            if (area == null)
            {
                return NotFound(new { message = "Không tìm thấy khu vực" });
            }
            return Ok(area);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin khu vực" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateArea([FromBody] CreateAreaViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Name))
            {
                return BadRequest(new { message = "Tên khu vực không được để trống" });
            }

            var area = await _areaService.CreateAreaAsync(model);
            return CreatedAtAction(nameof(GetAreaById), new { id = area.AreaId }, area);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo khu vực" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArea(int id, [FromBody] UpdateAreaViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Name))
            {
                return BadRequest(new { message = "Tên khu vực không được để trống" });
            }

            var area = await _areaService.UpdateAreaAsync(id, model);
            if (area == null)
            {
                return NotFound(new { message = "Không tìm thấy khu vực" });
            }
            return Ok(area);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật khu vực" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArea(int id)
    {
        try
        {
            var result = await _areaService.DeleteAreaAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy khu vực" });
            }
            return Ok(new { message = "Xóa khu vực thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa khu vực");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa khu vực" });
        }
    }
}
