using System;
using System.Collections.Generic;
using System.Text;

namespace PDHours.Application.DTOs.ReportDTO
{
    public class CreateReportDTO
    {
        public required string Description { get; set; }
        public required int EmployeeId { get; set; }
        public int SpentHours { get; set; }
    }
}
