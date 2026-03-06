using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PDHours.Domain.Models
{
    public class SquadModel
    {
        [Key]
        public int Id { get; set; }
        public required string Name { get; set; }

        public List<EmployeeModel>? Employees { get; set; }
    }
}
