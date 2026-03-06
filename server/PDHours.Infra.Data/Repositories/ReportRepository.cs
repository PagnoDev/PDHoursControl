using Microsoft.EntityFrameworkCore;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Application.Interfaces.IRepositories;
using PDHours.Domain.Models;
using PDHours.Infra.Data.Database.Context;
using PDHours.Infra.Data.Repositories.Base;

namespace PDHours.Infra.Data.Repositories
{
    public class ReportRepository : Repository<ReportModel>, IReportRepository
    {
        public ReportRepository(DataContext db) : base(db) { }

        public override IQueryable<ReportModel> GetAll()
        {
            return _db.Set<ReportModel>().Include(r => r.Employee);
        }

        public async Task<LastReportByEmployeeDTO?> GetLastReportByEmployeeId(int employeeId)
        {
            return await _db.Set<ReportModel>()
                .Where(r => r.EmployeeId == employeeId)
                .OrderByDescending(r => r.Created_At)
                .Select(r => new LastReportByEmployeeDTO
                {
                    Description = r.Description,
                    CreatedAt = r.Created_At
                })
                .FirstOrDefaultAsync();
        }
    }
}
