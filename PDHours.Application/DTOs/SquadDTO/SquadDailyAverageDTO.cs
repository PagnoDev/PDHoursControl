namespace PDHours.Application.DTOs.SquadDTO
{
    public class SquadDailyAverageDTO
    {
        public int SquadId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal AverageHoursPerDay { get; set; }
    }
}
