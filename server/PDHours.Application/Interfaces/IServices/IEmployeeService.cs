using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.Interfaces.IServices.Base;
using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IServices
{
    public interface IEmployeeService : IBaseService<EmployeeModel> 
    {
        Task<IQueryable<EmployeeListDTO>> GetListView();
    }
}
