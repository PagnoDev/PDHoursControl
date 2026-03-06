using PDHours.Application.Interfaces.IRepositories;
using PDHours.Application.Interfaces.IServices;
using PDHours.Application.Services.Base;
using PDHours.Application.DTOs.ReportDTO;
using PDHours.Domain.Models;

namespace PDHours.Application.Services
{
    public class ReportService : BaseService<ReportModel>, IReportService
    {
        private readonly IReportRepository _repository;
        private readonly IEmployeeRepository _employeeRepository;

        public ReportService(IReportRepository repository, IEmployeeRepository employeeRepository) : base(repository)
        {
            _repository = repository;
            _employeeRepository = employeeRepository;
        }

        public new void Add(ReportModel entity)
        {
            var employee = _employeeRepository.GetById(entity.EmployeeId);

            if (employee == null)
            {
                throw new InvalidOperationException($"Employee com ID {entity.EmployeeId} não existe.");
            }

            base.Add(entity);
        }

        public async Task<LastReportByEmployeeDTO?> GetLastReportByEmployeeId(int employeeId)
        {
            return await _repository.GetLastReportByEmployeeId(employeeId);
        }
    }
}
