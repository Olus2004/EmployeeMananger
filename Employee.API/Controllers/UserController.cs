using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Employee.Application.Services;
using Employee.Application.ViewModels;
using MySqlConnector;

namespace Employee.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "Username và Password không được để trống" });
            }

            var isValid = await _userService.ValidateLoginAsync(model);
            if (!isValid)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
            }

            var loggedInUser = await _userService.GetUserByUsernameAsync(model.Username);
            if (loggedInUser == null)
            {
                return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });
            }

            return Ok(new { 
                message = "Đăng nhập thành công",
                user = loggedInUser
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đăng nhập");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi đăng nhập" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách người dùng" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy thông tin người dùng" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "Username và Password không được để trống" });
            }

            // Xử lý employeeId: nếu là 0 hoặc null thì đặt thành null
            if (model.EmployeeId.HasValue && model.EmployeeId.Value <= 0)
            {
                model.EmployeeId = null;
            }

            var user = await _userService.CreateUserAsync(model);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            // Username already exists
            _logger.LogWarning(ex, "Tên đăng nhập đã tồn tại: {Username}", model.Username);
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // Invalid argument (e.g., empty username)
            _logger.LogWarning(ex, "Dữ liệu không hợp lệ: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            // Handle database constraint violations (duplicate username)
            if (ex.InnerException is MySqlException mysqlEx && 
                mysqlEx.Number == 1062) // Duplicate entry error code
            {
                _logger.LogWarning(ex, "Tên đăng nhập đã tồn tại (database constraint): {Username}", model.Username);
                return Conflict(new { message = $"Tên đăng nhập '{model.Username}' đã tồn tại. Vui lòng chọn tên đăng nhập khác." });
            }
            _logger.LogError(ex, "Lỗi khi tạo người dùng (database error)");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo người dùng" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo người dùng: {Message}", ex.Message);
            return StatusCode(500, new { message = ex.Message ?? "Đã xảy ra lỗi khi tạo người dùng" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserViewModel model)
    {
        try
        {
            // Xử lý employeeId: nếu là 0 hoặc null thì đặt thành null
            if (model.EmployeeId.HasValue && model.EmployeeId.Value <= 0)
            {
                model.EmployeeId = null;
            }

            var user = await _userService.UpdateUserAsync(id, model);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi cập nhật người dùng" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(new { message = "Xóa người dùng thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi xóa người dùng" });
        }
    }

    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        try
        {
            var model = new UpdateUserViewModel { Active = 2 }; // 2: không hoạt động
            var user = await _userService.UpdateUserAsync(id, model);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(new { message = "Vô hiệu hóa tài khoản thành công", user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi vô hiệu hóa người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi vô hiệu hóa người dùng" });
        }
    }

    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        try
        {
            var model = new UpdateUserViewModel { Active = 1 }; // 1: hoạt động
            var user = await _userService.UpdateUserAsync(id, model);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
            return Ok(new { message = "Kích hoạt tài khoản thành công", user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kích hoạt người dùng");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi kích hoạt người dùng" });
        }
    }

    [HttpPost("{id}/change-password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordViewModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.CurrentPassword) || string.IsNullOrEmpty(model.NewPassword))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại và mật khẩu mới không được để trống" });
            }

            if (model.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            var result = await _userService.ChangePasswordAsync(id, model.CurrentPassword, model.NewPassword);
            if (!result)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đổi mật khẩu");
            return StatusCode(500, new { message = "Đã xảy ra lỗi khi đổi mật khẩu" });
        }
    }
}

