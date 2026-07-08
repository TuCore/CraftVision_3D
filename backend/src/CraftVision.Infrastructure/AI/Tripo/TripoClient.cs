using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CraftVision.Application.Interfaces.AI.Tripo;

namespace CraftVision.Infrastructure.AI.Tripo;

public class TripoClient : ITripoClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TripoClient> _logger;

    public TripoClient(HttpClient httpClient, ILogger<TripoClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<TripoTaskResponse> CreateImageToModelTaskAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            type = "image_to_model",
            file = new
            {
                type = "jpg", // Assuming jpg or we can parse it from url/mime
                url = imageUrl
            },
            model_version = "v2.5-20250123"
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/v2/openapi/task")
        {
            Content = JsonContent.Create(payload)
        };

        _logger.LogInformation("Sending Tripo API Request: {Url}. Auth Header: {Auth}", 
            _httpClient.BaseAddress + "v2/openapi/task",
            _httpClient.DefaultRequestHeaders.Authorization?.ToString() ?? "NULL");

        var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Tripo API Error {Status}. Body: {Body}", response.StatusCode, errorContent);
            response.EnsureSuccessStatusCode();
        }

        return await response.Content.ReadFromJsonAsync<TripoTaskResponse>(cancellationToken: cancellationToken);
    }

    public async Task<TripoTaskStatusResponse> GetTaskStatusAsync(string taskId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"/v2/openapi/task/{taskId}", cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<TripoTaskStatusResponse>(cancellationToken: cancellationToken);
    }
}
