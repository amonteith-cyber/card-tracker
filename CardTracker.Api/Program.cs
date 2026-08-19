using CardTracker.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<CardCollectionDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("CardCollectionDatabase")));

builder.Services.AddOpenApiDocument();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();