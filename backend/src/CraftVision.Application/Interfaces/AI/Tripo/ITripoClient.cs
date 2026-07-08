using System.Threading;
using System.Threading.Tasks;

namespace CraftVision.Application.Interfaces.AI.Tripo;

public interface ITripoClient
{
    Task<TripoTaskResponse> CreateImageToModelTaskAsync(string imageUrl, CancellationToken cancellationToken = default);
    Task<TripoTaskStatusResponse> GetTaskStatusAsync(string taskId, CancellationToken cancellationToken = default);
}

public class TripoTaskResponse
{
    public int Code { get; set; }
    public string Message { get; set; }
    public TripoTaskData Data { get; set; }
    
    public bool IsSuccess => Code == 0;
    public string TaskId => Data?.TaskId;
    public string ErrorMsg => Message;
}

public class TripoTaskData
{
    public string TaskId { get; set; }
}

public class TripoTaskStatusResponse
{
    public int Code { get; set; }
    public string Message { get; set; }
    public TripoTaskStatusData Data { get; set; }
}

public class TripoTaskStatusData
{
    public string TaskId { get; set; }
    public string Type { get; set; }
    public string Status { get; set; } 
    public int Progress { get; set; }
    public int? RunningLeftTime { get; set; }
    public TripoTaskResult Result { get; set; }
    public string ErrorMsg { get; set; }
}

public class TripoTaskResult
{
    public string ModelUrl { get; set; } 
}
