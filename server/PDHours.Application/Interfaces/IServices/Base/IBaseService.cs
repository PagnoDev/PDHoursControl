using PDHours.Domain.Models;

namespace PDHours.Application.Interfaces.IServices.Base
{
    public interface IBaseService<T>
    {
        void Add(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task<T?> GetById(int id);
        Task<IQueryable<T>> GetAll();
    }
}
