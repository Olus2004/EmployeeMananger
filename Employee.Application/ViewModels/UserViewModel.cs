namespace Employee.Application.ViewModels;

public class UserViewModel
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public short Active { get; set; }
    public short Role { get; set; }
    public int? EmployeeId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserViewModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public short Active { get; set; } = 1;
    public short Role { get; set; } = 2; // 1: Admin, 2: User
    public int? EmployeeId { get; set; } // id nhân viên, có thể NULL
}

public class UpdateUserViewModel
{
    public string? Password { get; set; }
    public short Active { get; set; }
    public short? Role { get; set; }
    public int? EmployeeId { get; set; }
}

public class LoginViewModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordViewModel
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

