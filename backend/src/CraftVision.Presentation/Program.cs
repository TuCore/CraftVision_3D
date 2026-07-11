using System.Text;
using CraftVision.Presentation.HostedServices;
using CraftVision.Presentation.Middlewares;
using CraftVision.Application;
using CraftVision.Application.Interfaces;
using CraftVision.Application.Interfaces.Providers;
using CraftVision.Application.Interfaces.Repositories;
using CraftVision.Application.Interfaces.Services;
using CraftVision.Application.Services;
using CraftVision.Infrastructure;
using CraftVision.Infrastructure.Data;
using CraftVision.Infrastructure.Providers;
using CraftVision.Infrastructure.Repositories;
using CraftVision.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Npgsql.NameTranslation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // Cho phép frontend từ ngrok gọi API
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Configure OpenAPI (Swagger)
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new Microsoft.OpenApi.OpenApiComponents();
        document.Components.SecuritySchemes ??= new System.Collections.Generic.Dictionary<string, Microsoft.OpenApi.IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes.Add("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme."
        });

        var requirement = new Microsoft.OpenApi.OpenApiSecurityRequirement
        {
            [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document)] = new System.Collections.Generic.List<string>()
        };

        if (document.Paths != null)
        {
            foreach (var path in document.Paths.Values)
            {
                if (path.Operations != null)
                {
                    foreach (var operation in path.Operations.Values)
                    {
                        operation.Security ??= new System.Collections.Generic.List<Microsoft.OpenApi.OpenApiSecurityRequirement>();
                        operation.Security.Add(requirement);
                    }
                }
            }
        }

        return System.Threading.Tasks.Task.CompletedTask;
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// --- 1. CONFIG DATABASE CONNECTION ---
var activeConnName = builder.Configuration["ActiveConnection"] ?? "DockerConnection";
var connectionString = builder.Configuration.GetConnectionString(activeConnName);

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.UseVector();
var nullTranslator = new NpgsqlNullNameTranslator();
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.UserTier>("user_tier_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.FileType>("file_type_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MessageRole>("message_role_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.RequestStatus>("request_status_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.Difficulty>("difficulty_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.OptionLevel>("option_level_enum", nullTranslator);
dataSourceBuilder.MapEnum<CraftVision.Domain.Enums.MaterialUnit>("material_unit_enum", nullTranslator);
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource, o => 
    {
        o.UseVector();
        // EF Core 9+/10+ requires enum mapping here for EF level awareness
        o.MapEnum<CraftVision.Domain.Enums.UserTier>("user_tier_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.FileType>("file_type_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.MessageRole>("message_role_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.RequestStatus>("request_status_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.Difficulty>("difficulty_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.OptionLevel>("option_level_enum", nameTranslator: nullTranslator);
        o.MapEnum<CraftVision.Domain.Enums.MaterialUnit>("material_unit_enum", nameTranslator: nullTranslator);
    })
    .UseSnakeCaseNamingConvention()
);

// --- 2. CONFIG JWT AUTHENTICATION ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings["Secret"]!;

builder.Services.AddAuthentication(options => 
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});
builder.Services.AddAuthorization();

// --- 3. DEPENDENCY INJECTION ---
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<ITokenProvider, JwtTokenProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
// AI & Knowledge Base DI
builder.Services.AddHttpClient<IEmbeddingProvider, GeminiEmbeddingProvider>();
builder.Services.AddHttpClient<IAiChatProvider, GeminiChatProvider>();
builder.Services.AddScoped<IKnowledgeMaterialRepository, KnowledgeMaterialRepository>();
builder.Services.AddScoped<IKnowledgeTutorialRepository, KnowledgeTutorialRepository>();
builder.Services.AddScoped<IAiChatSessionRepository, AiChatSessionRepository>();
builder.Services.AddScoped<IAiChatMessageRepository, AiChatMessageRepository>();
builder.Services.AddScoped<IKnowledgeRetrievalService, KnowledgeRetrievalService>();
builder.Services.AddScoped<IAiChatService, AiChatService>();

// Register Hosted Services
builder.Services.AddHostedService<MemoryMonitorService>();

var app = builder.Build();

app.UseMiddleware<ApiProfilerMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "CraftVision 3D API");
        options.RoutePrefix = "swagger";
    });
}

// app.UseHttpsRedirection(); // Bỏ qua HTTPS Redirect khi dev để Next.js proxy (http://localhost:5192) hoạt động
app.UseStaticFiles(); // Allow serving uploaded images

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// --- API ĐỂ TEST KẾT NỐI DATABASE ---
app.MapGet("/api/test-db", async (ApplicationDbContext db) =>
{
    try 
    {
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect) 
        {
            return Results.Ok(new { 
                Message = "Thành công! Backend đã kết nối tới PostgreSQL (CraftVision_3D) qua Entity Framework Core.",
                Provider = db.Database.ProviderName
            });
        }
        else 
        {
            return Results.StatusCode(500);
        }
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message, title: "Lỗi kết nối Database");
    }
})
.WithName("TestDbConnection");

// --- API ĐỂ TEST ENTITIES MAPPING ---
app.MapGet("/api/test-entities", async (ApplicationDbContext db) =>
{
    try 
    {
        var users = await db.Users.CountAsync();
        var materials = await db.KnowledgeMaterials.CountAsync();
        var sessions = await db.AiChatSessions.CountAsync();

        return Results.Ok(new { 
            Message = "Entities map thành công với Database!",
            Data = new {
                UsersCount = users,
                KnowledgeMaterialsCount = materials,
                AiChatSessionsCount = sessions
            }
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.InnerException?.Message ?? ex.Message, title: "Lỗi Mapping Database");
    }
})
.WithName("TestEntitiesMapping");

// --- AUTO MIGRATE DATABASE ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // Tự động chạy tất cả các file Migration để tạo bảng trong Database (nếu chưa có)
    db.Database.Migrate();
}

app.Run();
