namespace PDHours.Application.DTOs.EmployeeDTO
{
    public class TotalHoursByEmployeeDTO
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalHours { get; set; }
    }
}
