using PDHours.Application.Interfaces.IRepositories;
using PDHours.Domain.Models;
using PDHours.Infra.Data.Database.Context;
using PDHours.Infra.Data.Repositories.Base;

namespace PDHours.Infra.Data.Repositories
{
    public class ReportRepository : Repository<ReportModel>, IReportRepository
    {
        public ReportRepository(DataContext db) : base(db) { }

        
    }
}
