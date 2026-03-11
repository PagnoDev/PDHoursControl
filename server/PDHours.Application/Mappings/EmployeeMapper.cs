using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Mappings
{
    public static class EmployeeMapper
    {
        public static EmployeeModel ToModel(this CreateEmployeeDTO dto)
        {
            return new EmployeeModel
            {
                Name = dto.Name,
                EstimateHours = dto.EstimateHours,
                SquadId = dto.SquadId
            };
        }
    }
}
