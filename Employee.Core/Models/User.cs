using System.ComponentModel.DataAnnotations.Schema;

namespace Employee.Core.Models;

public class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Column("password")]
    public string Password { get; set; } = string.Empty; // bcrypt hash

    [Column("active")]
    public short Active { get; set; } = 1; // 1: hoạt động, 2: ko hoạt động

    [Column("role")]
    public short Role { get; set; } = 2; // 1: Admin, 2: User

    [Column("employee_id")]
    public int? EmployeeId { get; set; } // id nhân viên liên kết, có thể NULL

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}

