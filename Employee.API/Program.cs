using Employee.Application;
using Employee.Application.Services;
using Employee.Infrastructure;
using OfficeOpenXml;

// Set EPPlus license (non-commercial use) - required for EPPlus 8+
ExcelPackage.License.SetNonCommercialOrganization("Employee Management System");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Infrastructure (DbContext, Repositories)
builder.Services.AddInfrastructure(builder.Configuration);

// Add Application (Services)
builder.Services.AddApplication();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

// Serve static files
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA
app.MapFallbackToFile("index.html");

// Recalculate employee stats on startup
using (var scope = app.Services.CreateScope())
{
    var recalculationService = scope.ServiceProvider.GetRequiredService<IEmployeeStatsRecalculationService>();
    try
    {
        await recalculationService.RecalculateAllEmployeesStatsAsync();
        Console.WriteLine("Đã tính toán và cập nhật thống kê nhân viên thành công.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Lỗi khi tính toán thống kê nhân viên: {ex.Message}");
    }
}

app.Run();
