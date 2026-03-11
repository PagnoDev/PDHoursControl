using PDHours.Application.DTOs.ReportDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Mappings
{
    public static class ReportMapper
    {
        public static ReportModel ToModel(this CreateReportDTO dto)
        {
            return new ReportModel
            {
                Description = dto.Description,
                EmployeeId = dto.EmployeeId,
                SpentHours = dto.SpentHours
            };
        }
    }
}
