using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PDHours.Domain.Models
{
    public class ReportModel
    {
        [Key]
        public int Id { get; set; }
        public required string Description { get; set; }
        public required int EmployeeId { get; set; }
        public int SpentHours { get; set; }
        public DateTime Created_At { get; set; }

        public EmployeeModel? Employee { get; set; }
    }
}
