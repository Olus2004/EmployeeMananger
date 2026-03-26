using Microsoft.AspNetCore.Mvc;
using Employee.Application.Services;
using Employee.Application.ViewModels;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;
    private readonly ILogger<FeedbackController> _logger;

    public FeedbackController(IFeedbackService feedbackService, ILogger<FeedbackController> logger)
    {
        _feedbackService = feedbackService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllFeedbacks()
    {
        try
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phản hồi" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFeedbackById(int id)
    {
        try
        {
            var feedback = await _feedbackService.GetFeedbackByIdAsync(id);
            if (feedback == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin phản hồi" });
        }
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetFeedbacksByEmployeeId(int employeeId)
    {
        try
        {
            var feedbacks = await _feedbackService.GetFeedbacksByEmployeeIdAsync(employeeId);
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi theo nhân viên");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phản hồi theo nhân viên" });
        }
    }

    [HttpGet("timesheet/{timesheetId}")]
    public async Task<IActionResult> GetFeedbacksByTimesheetId(int timesheetId)
    {
        try
        {
            var feedbacks = await _feedbackService.GetFeedbacksByTimesheetIdAsync(timesheetId);
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi theo bảng công");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phản hồi theo bảng công" });
        }
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingFeedbacks()
    {
        try
        {
            var feedbacks = await _feedbackService.GetPendingFeedbacksAsync();
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách phản hồi đang chờ");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách phản hồi đang chờ" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Description))
            {
                return BadRequest(new { message = "Mô tả phản hồi không được để trống" });
            }

            var feedback = await _feedbackService.CreateFeedbackAsync(model);
            return CreatedAtAction(nameof(GetFeedbackById), new { id = feedback.FeedbackId }, feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo phản hồi" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeedback(int id, [FromBody] UpdateFeedbackViewModel model)
    {
        try
        {
            var feedback = await _feedbackService.UpdateFeedbackAsync(id, model);
            if (feedback == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật phản hồi" });
        }
    }

    [HttpPost("{id}/respond")]
    public async Task<IActionResult> RespondFeedback(int id, [FromBody] RespondFeedbackViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.AdminResponse))
            {
                return BadRequest(new { message = "Phản hồi từ admin không được để trống" });
            }

            var feedback = await _feedbackService.RespondFeedbackAsync(id, model);
            if (feedback == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi phản hồi" });
        }
    }

    [HttpPut("{id}/close")]
    public async Task<IActionResult> CloseFeedback(int id)
    {
        try
        {
            var feedback = await _feedbackService.UpdateStatusAsync(id, 2); // 2: Đã đóng
            if (feedback == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đóng phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi đóng phản hồi" });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] short status)
    {
        try
        {
            if (status < 1 || status > 3)
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ. Phải là 1 (Đang xử lí), 2 (Đã đóng), hoặc 3 (Đã hoàn thành)" });
            }

            var feedback = await _feedbackService.UpdateStatusAsync(id, status);
            if (feedback == null)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật trạng thái");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật trạng thái" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        try
        {
            var result = await _feedbackService.DeleteFeedbackAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy phản hồi" });
            }
            return Ok(new { message = "Xóa phản hồi thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa phản hồi");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa phản hồi" });
        }
    }
}

