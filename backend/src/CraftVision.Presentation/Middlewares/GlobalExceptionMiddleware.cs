using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using CraftVision.Application.DTOs.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CraftVision.Presentation.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An unexpected error occurred.";

        // You can add more specific exception handling here if needed
        // e.g. if (exception is ValidationException) statusCode = HttpStatusCode.BadRequest;
        // else if (exception is NotFoundException) statusCode = HttpStatusCode.NotFound;

        if (exception is ArgumentException || exception is ArgumentNullException)
        {
            statusCode = HttpStatusCode.BadRequest;
            message = exception.Message;
        }
        else if (exception.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
        {
            statusCode = HttpStatusCode.NotFound;
            message = exception.Message;
        }
        else
        {
            // In a real production app, don't expose stack traces.
            // For MVP, we might show the message if it's safe.
            message = exception.Message; 
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse.Fail(message);
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
