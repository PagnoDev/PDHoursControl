using PDHours.Application.Interfaces.IRepositories.Base;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IRepositories
{
    public interface IReportRepository : IRepository<ReportModel>
    {
        Task<LastReportByEmployeeDTO?> GetLastReportByEmployeeId(int employeeId);
    }
}
