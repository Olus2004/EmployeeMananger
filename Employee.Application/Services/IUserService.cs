using Employee.Application.ViewModels;

namespace Employee.Application.Services;

public interface IUserService
{
    Task<IEnumerable<UserViewModel>> GetAllUsersAsync();
    Task<UserViewModel?> GetUserByIdAsync(int id);
    Task<UserViewModel> CreateUserAsync(CreateUserViewModel model);
    Task<UserViewModel?> UpdateUserAsync(int id, UpdateUserViewModel model);
    Task<bool> DeleteUserAsync(int id);
    Task<bool> ValidateLoginAsync(LoginViewModel model);
    Task<UserViewModel?> GetUserByUsernameAsync(string username);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}

