namespace PDHours.Application.DTOs.EmployeeDTO
{
    public class CreateEmployeeDTO
    {
        public required string Name { get; set; }
        public required int EstimateHours { get; set; }
        public required int SquadId { get; set; }
    }
}
