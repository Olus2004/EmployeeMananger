using Employee.Application.ViewModels;
using Employee.Core.Interfaces;
using Employee.Core.Models;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace Employee.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserViewModel>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserViewModel
        {
            Id = u.Id,
            Username = u.Username,
            Active = u.Active,
            Role = u.Role,
            EmployeeId = u.EmployeeId,
            CreatedAt = u.CreatedAt
        });
    }

    public async Task<UserViewModel?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        return new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Active = user.Active,
            Role = user.Role,
            EmployeeId = user.EmployeeId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserViewModel> CreateUserAsync(CreateUserViewModel model)
    {
        // Normalize username (trim and check)
        var normalizedUsername = model.Username?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedUsername))
        {
            throw new ArgumentException("Tên đăng nhập không được để trống.");
        }

        // Check if username already exists (case-insensitive check)
        var existingUser = await _userRepository.GetByUsernameAsync(normalizedUsername);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"Tên đăng nhập '{normalizedUsername}' đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
        }

        // Hash password using BCrypt
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);
        
        var user = new User
        {
            Username = normalizedUsername,
            Password = hashedPassword,
            Active = model.Active,
            Role = model.Role,
            // Đảm bảo rằng nếu EmployeeId có giá trị <= 0 hoặc null thì đặt thành null
            EmployeeId = model.EmployeeId.HasValue && model.EmployeeId.Value > 0 ? model.EmployeeId : null
        };

        try
        {
            await _userRepository.AddAsync(user);
        }
        catch (DbUpdateException ex)
        {
            // Handle race condition - if another request created the user between check and insert
            if (ex.InnerException is MySqlException mysqlEx && mysqlEx.Number == 1062)
            {
                throw new InvalidOperationException($"Tên đăng nhập '{normalizedUsername}' đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
            }
            throw;
        }

        return new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Active = user.Active,
            Role = user.Role,
            EmployeeId = user.EmployeeId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserViewModel?> UpdateUserAsync(int id, UpdateUserViewModel model)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(model.Password))
        {
            // Hash password using BCrypt
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
        }
        user.Active = model.Active;
        if (model.Role.HasValue)
        {
            user.Role = model.Role.Value;
        }
        // Cập nhật EmployeeId nếu được cung cấp (có thể là NULL để xóa liên kết)
        // Đảm bảo rằng nếu EmployeeId có giá trị <= 0 hoặc null thì đặt thành null
        user.EmployeeId = model.EmployeeId.HasValue && model.EmployeeId.Value > 0 ? model.EmployeeId : null;

        await _userRepository.UpdateAsync(user);

        return new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Active = user.Active,
            Role = user.Role,
            EmployeeId = user.EmployeeId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        await _userRepository.DeleteAsync(user);
        return true;
    }

    public async Task<bool> ValidateLoginAsync(LoginViewModel model)
    {
        var user = await _userRepository.GetByUsernameAsync(model.Username);
        if (user == null || user.Active != 1) return false;

        // Verify password using BCrypt
        try
        {
            return BCrypt.Net.BCrypt.Verify(model.Password, user.Password);
        }
        catch
        {
            // Handle case where password might be stored in plain text (for migration)
            // Fallback to plain text comparison for backward compatibility
            return user.Password == model.Password;
        }
    }

    public async Task<UserViewModel?> GetUserByUsernameAsync(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null) return null;

        return new UserViewModel
        {
            Id = user.Id,
            Username = user.Username,
            Active = user.Active,
            Role = user.Role,
            EmployeeId = user.EmployeeId,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        // Verify current password
        bool isCurrentPasswordValid;
        try
        {
            isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(currentPassword, user.Password);
        }
        catch
        {
            // Fallback to plain text comparison for backward compatibility
            isCurrentPasswordValid = user.Password == currentPassword;
        }

        if (!isCurrentPasswordValid)
        {
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng");
        }

        // Hash new password
        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _userRepository.UpdateAsync(user);

        return true;
    }
}

