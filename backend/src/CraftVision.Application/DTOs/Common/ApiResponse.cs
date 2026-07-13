using System.Collections.Generic;

namespace CraftVision.Application.DTOs.Common;

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string>? Errors { get; set; }

    public static ApiResponse Ok(string message = "Success") => new ApiResponse { Success = true, Message = message };
    public static ApiResponse Fail(string message, IEnumerable<string>? errors = null) => new ApiResponse { Success = false, Message = message, Errors = errors ?? new List<string>() };
}

public class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success") => new ApiResponse<T> { Success = true, Message = message, Data = data };
}
