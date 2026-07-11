using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CraftVision.Presentation.Middlewares
{
    public class ApiProfilerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiProfilerMiddleware> _logger;

        public ApiProfilerMiddleware(RequestDelegate next, ILogger<ApiProfilerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Path.StartsWithSegments("/api"))
            {
                await _next(context);
                return;
            }

            var sw = Stopwatch.StartNew();
            
            await _next(context);
            
            sw.Stop();
            _logger.LogInformation("[API Profiler] {Method} {Path} took {Elapsed} ms", 
                context.Request.Method, 
                context.Request.Path, 
                sw.ElapsedMilliseconds);
        }
    }
}
