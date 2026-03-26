using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Employee.Core.DTOs.AI;
using Employee.Core.Interfaces;

namespace Employee.Infrastructure.Services
{
    public class OpenClawService : IOpenClawService
    {
        private readonly HttpClient _httpClient;
        private readonly string _endpoint;
        private readonly string _apiKey;

        public OpenClawService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            // Default to the provided url from config, or back to the user's specific string
            _endpoint = configuration["OpenClaw:Endpoint"] ?? "http://127.0.0.1:18789/chat?session=agent%3Amain%3Amain";
            _apiKey = configuration["OpenClaw:ApiKey"] ?? string.Empty;
        }

        public async Task<ChatResponse> SendMessageAsync(ChatRequest request)
        {
            try
            {
                if (!string.IsNullOrEmpty(_apiKey))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
                }

                // Many local AI gateways support OpenAI format OR strict plain JSON format.
                // We'll send standard OpenAI structure which works with OpenClaw completion endpoint.
                // If OpenClaw's custom endpoint expects simple { "message": "hello" }, the user can adjust this payload payload here.
                var payload = new
                {
                    model = "openclaw:main",
                    messages = new[]
                    {
                        new { role = "system", content = "Bạn là một trợ lý ảo quản lý hệ thống web nhân sự. Nhiệm vụ của bạn là hỗ trợ quản trị viên điều hành, nhắc nhở tiến độ và cung cấp báo cáo nhân lực." },
                        new { role = "user", content = request.Message }
                    }
                };

                // Because the user URL uses `.../chat?session=...`, it is highly custom. We will POST the JSON payload.
                var response = await _httpClient.PostAsJsonAsync(_endpoint, payload);

                if (response.IsSuccessStatusCode)
                {
                    var responseJson = await response.Content.ReadAsStringAsync();
                    
                    try 
                    {
                        using var document = JsonDocument.Parse(responseJson);
                        var root = document.RootElement;
                        
                        // Parse OpenAI schema
                        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                        {
                            var messageObj = choices[0].GetProperty("message");
                            if (messageObj.TryGetProperty("content", out var content))
                            {
                                return new ChatResponse { Reply = content.GetString() ?? "", IsSuccess = true };
                            }
                        }
                        
                        // Parse simple proxy schema
                        if (root.TryGetProperty("reply", out var reply))
                        {
                            return new ChatResponse { Reply = reply.GetString() ?? "", IsSuccess = true };
                        }
                        else if (root.TryGetProperty("response", out var simpleResponse))
                        {
                            return new ChatResponse { Reply = simpleResponse.GetString() ?? "", IsSuccess = true };
                        }
                        else if (root.TryGetProperty("message", out var msg))
                        {
                            // if it returns { message: "xxx" }
                            return new ChatResponse { Reply = msg.GetString() ?? "", IsSuccess = true };
                        }

                        // Fallback: raw text
                        return new ChatResponse { Reply = responseJson, IsSuccess = true };
                    } 
                    catch 
                    {
                        // Fallback if not JSON (e.g. plain text response)
                        return new ChatResponse { Reply = responseJson, IsSuccess = true };
                    }
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return new ChatResponse { IsSuccess = false, ErrorMessage = $"Lỗi kết nối AI ({response.StatusCode}): {error}" };
                }
            }
            catch (Exception ex)
            {
                return new ChatResponse { IsSuccess = false, ErrorMessage = $"Lỗi hệ thống: {ex.Message}" };
            }
        }
    }
}
