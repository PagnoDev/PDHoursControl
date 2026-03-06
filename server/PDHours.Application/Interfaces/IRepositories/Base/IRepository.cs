using System;
using System.Collections.Generic;
using System.Text;

namespace PDHours.Application.Interfaces.IRepositories.Base
{
    public interface IRepository<T>
    {
        public IQueryable<T> GetAll();
        public T? GetById(int id);
        public void Add(T entity);
        public void Update(T entity);
        public void Delete(T entity);
    }
}
