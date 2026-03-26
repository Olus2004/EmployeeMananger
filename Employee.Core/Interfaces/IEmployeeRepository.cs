using EmployeeModel = Employee.Core.Models.Employee;

namespace Employee.Core.Interfaces;

public interface IEmployeeRepository : IRepository<EmployeeModel>
{
    Task<IEnumerable<EmployeeModel>> GetByAreaIdAsync(int areaId);
    Task<IEnumerable<EmployeeModel>> GetByTypeAsync(short type);
    Task<IEnumerable<EmployeeModel>> GetActiveEmployeesAsync();
    Task<EmployeeModel?> GetWithAreaAsync(int employeeId);
}

