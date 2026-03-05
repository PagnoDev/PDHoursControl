using Microsoft.EntityFrameworkCore;
using PDHours.Domain.Models;

namespace PDHours.Infra.Data.Database.Context
{
    public class DataContext : DbContext
    {
        public DbSet<EmployeeModel> Employees { get; set; }
        public DbSet<ReportModel> Reports { get; set; }
        public DbSet<SquadModel> Squads { get; set; }

        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EmployeeModel>()
                .HasMany(e => e.Reports)
                .WithOne(r => r.Employee)
                .HasForeignKey(r => r.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SquadModel>()
                .HasMany(s => s.Employees)
                .WithOne(e => e.Squad)
                .HasForeignKey(e => e.SquadId);
        }
    }
}
