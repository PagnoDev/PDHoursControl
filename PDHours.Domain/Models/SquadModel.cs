using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace PDHours.Domain.Models
{
    public class SquadModel
    {
        [Key]
        public required int Id { get; set; }
        public required string Name { get; set; }
        public List<EmployeeModel> Employees { get; set; }
    }
}
