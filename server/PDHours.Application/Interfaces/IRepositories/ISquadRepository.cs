using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.DTOs.SquadDTO;
using PDHours.Application.Interfaces.IRepositories.Base;
using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IRepositories
{
    public interface ISquadRepository : IRepository<SquadModel>
    {
        Task<IQueryable<SquadListDTO?>> GetListView();
        Task<List<TotalHoursByEmployeeDTO?>> GetHourByMember(int id, DateTime? startDate = null, DateTime? endDate = null);
        Task<int> GetTotalHours(int id);
        Task<SquadDailyAverageDTO?> GetDailyAverageByPeriod(int id, DateTime startDate, DateTime endDate);
    }
}
