using PDHours.Application.Interfaces.IRepositories;
using PDHours.Application.Interfaces.IServices;
using PDHours.Application.Services;
using PDHours.Infra.Data.Repositories;

namespace PDHours.API.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddScoped<ISquadRepository, SquadRepository>()
                    .AddScoped<IEmployeeRepository, EmployeeRepository>()
                    .AddScoped<IReportRepository, ReportRepository>();

            services.AddScoped<ISquadService, SquadService>()
                    .AddScoped<IEmployeeService, EmployeeService>()
                    .AddScoped<IReportService, ReportService>();

            return services;
        }
    }
}
