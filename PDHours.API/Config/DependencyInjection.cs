using Microsoft.EntityFrameworkCore;
using PDHours.Infra.Data.Database.Context;

namespace PDHours.API.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services, IConfiguration config)
        {
            return services;
        }
    }
}
