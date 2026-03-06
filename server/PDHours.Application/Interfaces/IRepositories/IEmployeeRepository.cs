using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.Interfaces.IRepositories.Base;
using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IRepositories
{
    public interface IEmployeeRepository : IRepository<EmployeeModel>
    {
        Task<IQueryable<EmployeeListDTO>> GetListView();
    }
}
