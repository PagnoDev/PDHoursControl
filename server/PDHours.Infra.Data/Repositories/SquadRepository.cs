using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.DTOs.SquadDTO;
using PDHours.Application.Interfaces.IRepositories;
using PDHours.Domain.Models;
using PDHours.Infra.Data.Database.Context;
using PDHours.Infra.Data.Repositories.Base;

namespace PDHours.Infra.Data.Repositories
{
    public class SquadRepository : Repository<SquadModel>, ISquadRepository
    {
        public SquadRepository(DataContext db) : base(db) { }

        public override SquadModel? GetById(int id) => _db?.Set<SquadModel>()?.Include(s => s.Employees).FirstOrDefault(s => s.Id == id);

        public async Task<IQueryable<SquadListDTO?>> GetListView()
        {
            return _db.Squads.Select(s => new SquadListDTO
            {
                Id = s.Id,
                Name = s.Name
            });
        }

        public async Task<List<TotalHoursByEmployeeDTO>> GetHourByMember(int id, DateTime? startDate = null, DateTime? endDate = null)
        {
            DateTime? startDateUtc = startDate.HasValue ? DateTime.SpecifyKind(startDate.Value.Date, DateTimeKind.Utc) : (DateTime?)null;
            DateTime? endDateUtcExclusive = endDate.HasValue ? DateTime.SpecifyKind(endDate.Value.Date.AddHours(24), DateTimeKind.Utc) : (DateTime?)null;

            List<TotalHoursByEmployeeDTO> data = await _db.Employees
                .Where(e => e.SquadId == id)
                .Select(e => new TotalHoursByEmployeeDTO
                {
                    EmployeeId = e.Id,
                    Name = e.Name,
                    TotalHours = e.Reports
                        .Where(r =>
                            (!startDateUtc.HasValue || r.Created_At >= startDateUtc.Value) &&
                            (!endDateUtcExclusive.HasValue || r.Created_At <= endDateUtcExclusive.Value))
                        .Sum(r => (int?)r.SpentHours) ?? 0
                })
                .ToListAsync();

            if (!data.Any())
            {
                return [];
            }

            return data;
        }

        public async Task<int> GetTotalHours(int id)
        {
            int totalHours = await _db.Squads
                .Where(s => s.Id == id)
                .Select(s => s.Employees
                    .Sum(e => e.Reports
                    .Sum(r => r.SpentHours)))
                .FirstOrDefaultAsync();

            return totalHours;
        }

        public async Task<SquadDailyAverageDTO?> GetDailyAverageByPeriod(int id, DateTime startDate, DateTime endDate)
        {
            DateTime? startDateUtc = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
            DateTime? endDateUtcExclusive = DateTime.SpecifyKind(endDate.Date.AddDays(1), DateTimeKind.Utc);
            int totalDays = (endDate.Date - startDate.Date).Days + 1;

            var squadData = await _db.Squads
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    TotalHours = s.Employees!
                        .SelectMany(e => e.Reports!)
                        .Where(r => r.Created_At >= startDateUtc && r.Created_At < endDateUtcExclusive)
                        .Sum(r => (int?)r.SpentHours) ?? 0
                })
                .FirstOrDefaultAsync();

            if (squadData == null)
            {
                return null;
            }

            decimal average = totalDays > 0 ? Math.Round((decimal)squadData.TotalHours / totalDays, 2) : 0m;

            return new SquadDailyAverageDTO
            {
                SquadId = squadData.Id,
                Name = squadData.Name,
                AverageHoursPerDay = average
            };
        }

    }
}
