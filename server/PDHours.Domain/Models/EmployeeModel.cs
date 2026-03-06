using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PDHours.Domain.Models
{
    public class EmployeeModel
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }
        public required int EstimateHours { get; set; }
        public required int SquadId { get; set; }

        [JsonIgnore]
        public SquadModel? Squad { get; set; }
        [JsonIgnore]
        public List<ReportModel>? Reports { get; set; }
    }   
}
