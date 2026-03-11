using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.Interfaces.IRepositories;
using PDHours.Application.Interfaces.IServices;
using PDHours.Application.Mappings;
using PDHours.Application.Services.Base;
using PDHours.Domain.Models;

namespace PDHours.Application.Services
{
    public class EmployeeService : BaseService<EmployeeModel>, IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly ISquadRepository _squadRepository;

        public EmployeeService(IEmployeeRepository repository, ISquadRepository squadRepository) : base(repository)
        {
            _repository = repository;
            _squadRepository = squadRepository;
        }

        public void Create(CreateEmployeeDTO dto)
        {
            SquadModel? squad = _squadRepository.GetById(dto.SquadId);

            if (squad == null)
                throw new InvalidOperationException($"Squad com ID {dto.SquadId} não existe.");

            EmployeeModel entity = dto.ToModel();
            base.Add(entity);
        }

        public new void Add(EmployeeModel entity)
        {
            SquadModel? squad = _squadRepository.GetById(entity.SquadId);

            if (squad == null)
                throw new InvalidOperationException($"Squad com ID {entity.SquadId} não existe.");

            base.Add(entity);
        }

        public Task<IQueryable<EmployeeListDTO>> GetListView()
        {
            return _repository.GetListView();
        }
    }
}
