using PDHours.Application.Interfaces.IServices.Base;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IServices
{
    public interface IReportService : IBaseService<ReportModel>
    {
        void Create(CreateReportDTO dto);
        Task<LastReportByEmployeeDTO?> GetLastReportByEmployeeId(int employeeId);
    }
}
