using Employee.Core.DTOs.AI;
using System.Threading.Tasks;

namespace Employee.Core.Interfaces
{
    public interface IOpenClawService
    {
        Task<ChatResponse> SendMessageAsync(ChatRequest request);
    }
}
