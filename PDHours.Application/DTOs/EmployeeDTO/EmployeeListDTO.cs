namespace PDHours.Application.DTOs.EmployeeDTO
{
    public class EmployeeListDTO
    {
        public required string Name { get; set; }
        public required int EstimateHours { get; set; }
        public required int SquadId { get; set; }
    }
}
