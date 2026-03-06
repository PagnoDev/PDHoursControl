using PDHours.Application.Interfaces.IRepositories.Base;
using PDHours.Infra.Data.Database.Context;

namespace PDHours.Infra.Data.Repositories.Base
{
    public abstract class Repository<T> : IRepository<T> where T : class
    {
        protected readonly DataContext _db;

        public Repository(DataContext db)
        {
            _db = db;
        }

        public virtual void Add(T entity)
        {
            _db.Set<T>().Add(entity);
            _db.SaveChanges();
        }

        public virtual void Delete(T entity)
        {
            _db.Set<T>().Remove(entity);
            _db.SaveChanges();
        }

        public virtual IQueryable<T> GetAll()
        {
            return _db.Set<T>().AsQueryable();
        }

        public virtual T? GetById(int id) => _db?.Set<T>()?.Find(id);

        public virtual void Update(T entity)
        {
            _db.Set<T>().Update(entity);
            _db.SaveChanges();
        }
    }
}
