using PDHours.Application.Interfaces.IRepositories.Base;
using PDHours.Application.Interfaces.IServices.Base;
namespace PDHours.Application.Services.Base
{
    public abstract class BaseService<T> : IBaseService<T>
    {
        private readonly IRepository<T> _repository;

        public BaseService(IRepository<T> repository)
        {
            _repository = repository;
        }

        public async void Add(T entity)
        {
            _repository.Add(entity);
        }

        public async void Update(T entity)
        {
            _repository.Update(entity);
        }

        public async void Delete(T entity)
        {
            _repository.Delete(entity);
        }

        public async Task<T?> GetById(int id)
        {
            return _repository.GetById(id);
        }

        public async Task<IQueryable<T>> GetAll()
        {
            return _repository.GetAll();
        }
    }
}
