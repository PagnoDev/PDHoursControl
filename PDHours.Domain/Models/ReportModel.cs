using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json.Serialization;

namespace PDHours.Domain.Models
{
    public class ReportModel
    {
        [Key]
        public required int Id { get; set; }
        public required string Description { get; set; }
        public required int EmployeeId { get; set; }
        public int SpentHours { get; set; }
        public DateTime Created_At { get; set; } = DateTime.Now;

        [JsonIgnore]
        public required EmployeeModel Employee { get; set; }
    }
}
