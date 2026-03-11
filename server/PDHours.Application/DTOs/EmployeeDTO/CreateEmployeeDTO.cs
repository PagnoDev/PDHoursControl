using System.ComponentModel.DataAnnotations;

namespace PDHours.Application.DTOs.EmployeeDTO
{
    public class CreateEmployeeDTO
    {
        public required string Name { get; set; }
        
        [Range(1, 12, ErrorMessage = "EstimateHours deve ser entre 1 e 12.")]
        public required int EstimateHours { get; set; }
        public required int SquadId { get; set; }
    }
}
