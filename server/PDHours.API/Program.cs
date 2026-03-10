using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using PDHours.API.DependencyInjection;
using PDHours.Infra.Data.Database.Context;

var builder = WebApplication.CreateBuilder(args);
const string CorsPolicyName = "AngularLocalhost";

builder.WebHost.UseUrls("http://0.0.0.0:5022");

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Adciona as dependências do projeto (Costumo deixar na pasta Config)
builder.Services.AddProjectServices(builder.Configuration);
builder.Services.AddDbContext<DataContext>(options =>
{
    var provider = builder.Configuration["DatabaseProvider"]?.Trim().ToLowerInvariant();

    switch (provider)
    {
        case "postgresql":
        case "postgres":
            var pgConnectionString = builder.Configuration.GetConnectionString("PostgreSql")
                ?? throw new InvalidOperationException("Connection string 'PostgreSql' não encontrada.");
            options.UseNpgsql(pgConnectionString);
            break;

        case "mysql":
            var mySqlConnectionString = builder.Configuration.GetConnectionString("MySql")
                ?? throw new InvalidOperationException("Connection string 'MySql' não encontrada.");
            options.UseMySql(mySqlConnectionString, new MySqlServerVersion(new Version(8, 0, 36)));
            break;

        default:
            throw new InvalidOperationException("DatabaseProvider inválido. Use 'PostgreSql' ou 'MySql'.");
    }

    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

builder.Services.AddOData(options => options.Select()
                                            .Filter()
                                            .OrderBy()
                                            .Count()
                                            .Expand());

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(CorsPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();
