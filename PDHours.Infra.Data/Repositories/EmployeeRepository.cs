using Microsoft.EntityFrameworkCore;
using PDHours.Application.DTOs.EmployeeDTO;
using PDHours.Application.Interfaces.IRepositories;
using PDHours.Domain.Models;
using PDHours.Infra.Data.Database.Context;
using PDHours.Infra.Data.Repositories.Base;

namespace PDHours.Infra.Data.Repositories
{
    public class EmployeeRepository : Repository<EmployeeModel>, IEmployeeRepository
    {
        public EmployeeRepository(DataContext db) : base(db) { }

        public override EmployeeModel? GetById(int id)
        {
            return _db.Employees.Include(e => e.Reports).FirstOrDefault(e => e.Id == id);
        }

        public async Task<IQueryable<EmployeeListDTO>> GetListView()
        {
            IQueryable<EmployeeListDTO> list = _db.Employees.Select(e => new EmployeeListDTO
            {
                Name = e.Name,
                EstimateHours = e.EstimateHours,
                SquadId = e.SquadId
            });

            return list;
        }
    }
}
