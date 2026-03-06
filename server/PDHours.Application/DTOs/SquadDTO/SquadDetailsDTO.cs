using PDHours.Domain.Models;

namespace PDHours.Application.DTOs.SquadDTO
{
    public class SquadDetailsDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }

        public List<EmployeeModel>? Employees { get; set; }
    }
}
