using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.DTOs.SquadDTO;
using PDHours.Application.Interfaces.IRepositories;
using PDHours.Application.Interfaces.IServices;
using PDHours.Application.Mappings;
using PDHours.Application.Services.Base;
using PDHours.Domain.Models;

namespace PDHours.Application.Services
{
    public class SquadService : BaseService<SquadModel>, ISquadService
    {
        private readonly ISquadRepository _repository;

        public SquadService(ISquadRepository repository) : base(repository)
        {
            _repository = repository;
        }

        public void Create(CreateSquadDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new InvalidOperationException("O nome da squad é obrigatório.");

            SquadModel entity = dto.ToModel();
            base.Add(entity);
        }

        public Task<IQueryable<SquadListDTO?>> GetListView()
        {
            return _repository.GetListView();
        }

        public async Task<List<TotalHoursByEmployeeDTO?>> GetHourByMember(int id, DateTime? startDate = null, DateTime? endDate = null)
        {
            return await _repository.GetHourByMember(id, startDate, endDate);
        }

        public async Task<int> GetTotalHours(int id, DateTime? startDate = null, DateTime? endDate = null)
        {
            return await _repository.GetTotalHours(id, startDate, endDate);
        }

        public async Task<SquadDailyAverageDTO?> GetDailyAverageByPeriod(int id, DateTime startDate, DateTime endDate)
        {
            return await _repository.GetDailyAverageByPeriod(id, startDate, endDate);
        }
    }
}
